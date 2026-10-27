param(
  [Parameter(Mandatory = $true)][string]$Source,
  [Parameter(Mandatory = $true)][string]$Output,
  [Parameter(Mandatory = $true)][ValidatePattern('^[a-fA-F0-9]{64}$')][string]$ExpectedCliHash,
  [string]$CertificateThumbprint
)

$ErrorActionPreference = 'Stop'
$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$outputPath = [System.IO.Path]::GetFullPath($Output)
if (Test-Path -LiteralPath $outputPath) { throw 'Output already exists; existing packages must not be overwritten.' }
if ($outputPath.StartsWith($sourcePath + '\', [StringComparison]::OrdinalIgnoreCase)) {
  throw 'Output must not be inside the source package.'
}
$cli = Join-Path $sourcePath 'resources\opencode-cli.exe'
if (-not (Test-Path -LiteralPath $cli -PathType Leaf)) {
  throw 'CLI is missing. Check Defender protection history; do not restore quarantined files just to sign them.'
}
if ((Get-FileHash -LiteralPath $cli -Algorithm SHA256).Hash -ne $ExpectedCliHash) {
  throw 'CLI differs from the reviewed artifact. Review the new build before signing.'
}
$files = @('Renicode.exe', 'resources\opencode-cli.exe')
$originals = @{}
foreach ($relative in $files) {
  $file = Join-Path $sourcePath $relative
  if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Package file is missing: $relative" }
  if ((Get-AuthenticodeSignature -LiteralPath $file).Status -ne 'NotSigned') {
    throw "Refusing to replace an existing signature: $relative"
  }
  $originals[$relative] = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash
}

# Keep the private key in the current user's protected store, never in the repository or package.
# Creating a signing certificate does not add it to Trusted Root or Trusted Publishers.
if ($CertificateThumbprint) {
  $certificate = Get-Item -LiteralPath "Cert:\CurrentUser\My\$CertificateThumbprint"
} else {
  $certificate = New-SelfSignedCertificate -Type CodeSigningCert `
    -Subject 'CN=Renicode Local Development' -FriendlyName 'Renicode local code signing' `
    -CertStoreLocation 'Cert:\CurrentUser\My' -KeyAlgorithm RSA -KeyLength 3072 `
    -HashAlgorithm SHA256 -KeyExportPolicy NonExportable -NotAfter (Get-Date).AddYears(2)
}
if (-not $certificate.HasPrivateKey) { throw 'Signing certificate has no private key.' }

# Do not modify deployed A/B slots: their integrity manifests cover the unsigned bytes.
New-Item -ItemType Directory -Path $outputPath | Out-Null
Get-ChildItem -LiteralPath $sourcePath -Force | Copy-Item -Destination $outputPath -Recurse
$results = foreach ($relative in $files) {
  $file = Join-Path $outputPath $relative
  if ((Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $originals[$relative]) {
    throw "Copied artifact differs from the reviewed source: $relative"
  }
  $signature = Set-AuthenticodeSignature -LiteralPath $file -Certificate $certificate `
    -HashAlgorithm SHA256 -IncludeChain Signer
  if ($signature.SignerCertificate.Thumbprint -ne $certificate.Thumbprint) {
    throw "Signature was not written successfully: $relative ($($signature.Status))"
  }
  if ($signature.Status -notin @('Valid', 'NotTrusted')) {
    throw "Signature verification failed: $relative ($($signature.Status))"
  }
  [PSCustomObject]@{
    file = $relative
    unsignedSha256 = $originals[$relative]
    signedSha256 = (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash
    status = [string]$signature.Status
    statusMessage = $signature.StatusMessage
    signerThumbprint = $signature.SignerCertificate.Thumbprint
  }
}
Export-Certificate -Cert $certificate -FilePath (Join-Path $outputPath 'renicode-local.cer') | Out-Null
[PSCustomObject]@{
  createdAt = (Get-Date).ToUniversalTime().ToString('o')
  source = $sourcePath
  certificateSubject = $certificate.Subject
  certificateThumbprint = $certificate.Thumbprint
  certificateExpires = $certificate.NotAfter.ToUniversalTime().ToString('o')
  trustedRootInstalled = $false
  timestamped = $false
  files = @($results)
} | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $outputPath 'signing-report.json') -Encoding UTF8
$results | Format-List
Write-Output "Signed copy: $outputPath"
Write-Output 'Self-signing is not malware clearance or public publisher trust. No security exclusions were added.'

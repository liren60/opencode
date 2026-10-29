param([string]$Output = "$PSScriptRoot\..\resources\renicode")
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
[System.IO.Directory]::CreateDirectory($Output) | Out-Null
$images = @(16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 192, 256) | ForEach-Object {
  $size = $_
  $bitmap = New-Object System.Drawing.Bitmap($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = 'AntiAlias'
  $graphics.ScaleTransform(($size / 64.0), ($size / 64.0))
  $shape = New-Object System.Drawing.Drawing2D.GraphicsPath
  $shape.AddArc(1, 1, 36, 36, 180, 90)
  $shape.AddArc(27, 1, 36, 36, 270, 90)
  $shape.AddArc(27, 27, 36, 36, 0, 90)
  $shape.AddArc(1, 27, 36, 36, 90, 90)
  $shape.CloseFigure()
  $gradient = New-Object System.Drawing.Drawing2D.LinearGradientBrush([System.Drawing.Point]::new(8, 4), [System.Drawing.Point]::new(56, 60), [System.Drawing.ColorTranslator]::FromHtml('#B89AFF'), [System.Drawing.ColorTranslator]::FromHtml('#4DAAFF'))
  $blend = New-Object System.Drawing.Drawing2D.ColorBlend
  $blend.Colors = @([System.Drawing.ColorTranslator]::FromHtml('#B89AFF'), [System.Drawing.ColorTranslator]::FromHtml('#8B6CFF'), [System.Drawing.ColorTranslator]::FromHtml('#4DAAFF'))
  $blend.Positions = @(0.0, 0.48, 1.0)
  $gradient.InterpolationColors = $blend
  $graphics.FillPath($gradient, $shape)
  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 6)
  $pen.StartCap = 'Round'
  $pen.EndCap = 'Round'
  $pen.LineJoin = 'Round'
  $letter = New-Object System.Drawing.Drawing2D.GraphicsPath
  $letter.AddLine(21, 46, 21, 18)
  $letter.AddLine(21, 18, 34, 18)
  $letter.AddBezier(34, 18, 40, 18, 43, 21, 43, 26)
  $letter.AddBezier(43, 26, 43, 31, 40, 34, 34, 34)
  $letter.AddLine(34, 34, 21, 34)
  $letter.StartFigure()
  $letter.AddLine(33, 34, 44, 46)
  $graphics.DrawPath($pen, $letter)
  $stream = New-Object System.IO.MemoryStream
  $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
  $bytes = $stream.ToArray()
  if ($size -eq 256) { [System.IO.File]::WriteAllBytes("$Output\icon.png", $bytes) }
  $stream.Dispose()
  $letter.Dispose()
  $pen.Dispose()
  $gradient.Dispose()
  $shape.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
  [PSCustomObject]@{ Size = $size; Bytes = $bytes }
}
$file = [System.IO.File]::Create("$Output\icon.ico")
$writer = New-Object System.IO.BinaryWriter($file)
$writer.Write([uint16]0)
$writer.Write([uint16]1)
$writer.Write([uint16]$images.Count)
$offset = 6 + 16 * $images.Count
foreach ($image in $images) {
  $dimension = if ($image.Size -eq 256) { 0 } else { $image.Size }
  $writer.Write([byte]$dimension)
  $writer.Write([byte]$dimension)
  $writer.Write([uint16]0)
  $writer.Write([uint16]1)
  $writer.Write([uint16]32)
  $writer.Write([uint32]$image.Bytes.Length)
  $writer.Write([uint32]$offset)
  $offset += $image.Bytes.Length
}
foreach ($image in $images) { $writer.Write([byte[]]$image.Bytes) }
$writer.Dispose()

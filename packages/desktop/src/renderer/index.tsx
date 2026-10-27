// @refresh reload

import "./diagnostics"
import "./styles.css"
import "./renicode.css"
import { render } from "solid-js/web"
import { api } from "./api"
import { DesktopApp } from "./desktop-app"
import { startDesktopMenu } from "./platform/menu"
import { startDeepLinks } from "./startup/deep-links"
import { requireRendererRoot } from "./startup/root"
import { desktopVersion, initializeSentry } from "./startup/sentry"
import { RENICODE } from "@opencode/ui/renicode"

if (RENICODE) document.documentElement.dataset.brand = "renicode"

const root = requireRendererRoot()

const version = desktopVersion()

startDesktopMenu(api)

startDeepLinks(api)

render(() => <DesktopApp api={api} version={version} />, root)

void initializeSentry(version)

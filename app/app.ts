import * as app from "tns-core-modules/application";
import { Theme } from "@nativescript/theme";
import appViewModel from "./app-view-model";

Theme.setMode(Theme.Light);

app.run({ moduleName: "app-root", bindingContext: appViewModel, animated: true });

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/

import * as app from "tns-core-modules/application";
import { Theme } from "@nativescript/theme";
import "nativescript-sqlite";
import databaseService from "~/services/database.service";
import appViewModel from "./app-view-model";

Theme.setMode(Theme.Light);
databaseService.start()
  .then(connection => {
    if (connection) {
      console.log(`Is Connected to database: ${connection.isConnected}`);
    }

  })
  .catch(err => console.error(err));

app.run({ moduleName: "app-root", bindingContext: appViewModel, animated: true });
/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/

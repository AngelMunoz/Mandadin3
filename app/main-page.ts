import { NavigatedData, Page } from "tns-core-modules/ui/page/page";
import appViewModel from "./app-view-model";

export function onNavigatingTo(args: NavigatedData) {
  const page = args.object as Page;
  page.bindingContext = appViewModel;
}

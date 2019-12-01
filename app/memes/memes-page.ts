import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { MemesViewModel } from "./memes-view-model";
import appViewModel from "~/app-view-model";

const vm = new MemesViewModel(appViewModel);

export function onNavigatingTo(args: NavigatedData) {
  const page = args.object as Page;
  page.bindingContext = vm;
}

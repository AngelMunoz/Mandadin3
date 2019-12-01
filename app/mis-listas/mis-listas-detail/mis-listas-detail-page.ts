import { EventData, View } from "tns-core-modules/ui/core/view";
import { Page } from "tns-core-modules/ui/page";

export function onBackButtonTap(args: EventData) {
  const view = args.object as View;
  const page = view.page as Page;

  page.frame.goBack();
}

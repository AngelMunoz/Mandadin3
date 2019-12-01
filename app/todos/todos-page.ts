import { View } from "tns-core-modules/ui/core/view";
import { NavigatedData, Page } from "tns-core-modules/ui/page";
import { ListViewEventData } from "nativescript-ui-listview";

import { TodosViewModel } from "./todos-view-model";
import { Todo } from "~/interfaces/todo.interface";
import todoService from "~/services/todo.service";
import { TodosDetailViewModel } from "./todos-detail/todos-detail-view-model";

const vm = new TodosViewModel(todoService);
export function onNavigatingTo(args: NavigatedData) {
  const page = args.object as Page;
  if (args.isBackNavigation) {
    vm.refreshTodos();
  }
  page.bindingContext = vm;
}

export function onSelected(args: ListViewEventData) {
  const view = args.view as View;
  const page = view.page as Page;
  const tappedItem = view.bindingContext as Todo;

  page.frame.navigate({
    moduleName: "todos/todos-detail/todos-detail-page",
    bindingContext: new TodosDetailViewModel(tappedItem, todoService, page.frame),
    animated: true,
    transition: {
      name: "slide",
      duration: 200,
      curve: "ease"
    }
  });
}

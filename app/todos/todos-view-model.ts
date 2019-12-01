import { Observable, EventData } from "tns-core-modules/data/observable";
import { Todo } from "~/interfaces/todo.interface";
import { TodoService } from "~/services/todo.service";
import { PaginationArgs } from "~/interfaces/pagination";
import { ObservableArray } from "@nativescript/core/data/observable-array/observable-array";
import { LoadOnDemandListViewEventData, RadListView, ListViewEventData } from "nativescript-ui-listview";
import { shareText } from "nativescript-social-share";
import { Button } from "tns-core-modules/ui/button/button";
import { setText } from "nativescript-clipboard";

export class TodosViewModel extends Observable {

  private _todos: ObservableArray<Todo> = new ObservableArray<Todo>();
  private _title = "";
  private _content = "";
  private pagination: PaginationArgs<Todo> = {
    limit: 10,
    page: 1,
    order: [{ property: "id", direction: "desc" }]
  };

  constructor(private $todos: TodoService) {
    super();
    this.refreshTodos();
  }

  get title() {
    return this._title;
  }

  set title(str: string) {
    this._title = str;
    this.notifyPropertyChange("title", str);
  }

  get content() {
    return this._content;
  }

  set content(str: string) {
    this._content = str;
    this.notifyPropertyChange("content", str);
  }

  get todos() {
    return this._todos;
  }

  saveCurrentTodo() {
    if (this.$todos.exists(this.title)) { return; }
    const todo: Todo = {
      id: `${Date.now()}`,
      title: this.title,
      content: this.content
    };
    this.$todos.create(todo);
    this.title = "";
    this.content = "";
    this.refreshTodos();
  }

  onShare(args: EventData) {
    const todo: Todo = (args.object as Button).bindingContext;
    const formatted = `${todo.title ? `${todo.title}\n\n` : ""}${todo.content ? todo.content : ""}`;
    shareText(formatted, todo.title);
  }

  onCopy(args: EventData) {
    const todo: Todo = (args.object as Button).bindingContext;
    const formatted = `${todo.title ? `${todo.title}\n\n` : ""}${todo.content ? todo.content : ""}`;
    setText(formatted);
  }

  onMoreDataRequested(args: LoadOnDemandListViewEventData) {
    const listView: RadListView = args.object;
    const found = this.$todos.find(this.pagination);
    if (found.length === 0) {
      args.returnValue = false;
      listView.notifyLoadOnDemandFinished(true);

      return;
    }
    for (const todo of found) {
      if (!this.todos.some((td) => td.id === todo.id)) {
        this.todos.push(todo);
      }
    }
    this.pagination.page++;
    this.notifyPropertyChange("todos", this.todos);
    listView.notifyLoadOnDemandFinished();
    args.returnValue = true;
  }

  onPullToRefreshInitiated(args: ListViewEventData) {
    const listView = args.object as RadListView;
    const pages = [];
    for (let page = 1; page <= this.pagination.page; page++) {
      const pagination = { ...this.pagination, page };
      const todos = this.$todos.find(pagination);
      pages.push(...todos);
    }
    this._todos = new ObservableArray<Todo>();
    this.todos.push(...pages);
    this.notifyPropertyChange("todos", this.todos);
    listView.notifyPullToRefreshFinished();
  }

  refreshTodos() {
    const pages = [];
    for (let page = 1; page <= this.pagination.page; page++) {
      const pagination = { ...this.pagination, page };
      const todos = this.$todos.find(pagination);
      pages.push(...todos);
    }
    this._todos = new ObservableArray<Todo>();
    this.todos.push(...pages);
    this.notifyPropertyChange("todos", this.todos);
  }

}

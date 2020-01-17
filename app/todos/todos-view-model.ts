import { Observable, EventData } from "tns-core-modules/data/observable";
import { ITodo } from "~/interfaces/todo.interface";
import { IPaginationArgs } from "~/interfaces/pagination";
import { ObservableArray } from "@nativescript/core/data/observable-array/observable-array";
import { LoadOnDemandListViewEventData, RadListView, ListViewEventData } from "nativescript-ui-listview";
import { shareText } from "nativescript-social-share";
import { Button } from "tns-core-modules/ui/button/button";
import { setText } from "nativescript-clipboard";
import { Todo } from "~/models";
import { getOffset } from "~/utils";

export class TodosViewModel extends Observable {

  private _todos: ObservableArray<ITodo> = new ObservableArray<ITodo>();
  private _title = "";
  private _content = "";
  private pagination: IPaginationArgs<ITodo> = {
    limit: 10,
    page: 1
  };

  constructor() {
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

  async saveCurrentTodo() {
    const exists = await Todo.titleExists(this.title);
    if (exists) { return; }
    const todo: Partial<ITodo> = {
      title: this.title,
      content: this.content
    };

    const newTodo = new Todo(todo);
    await newTodo.save();

    this.title = "";
    this.content = "";

    return this.refreshTodos();
  }

  onShare(args: EventData) {
    const todo: ITodo = (args.object as Button).bindingContext;
    const formatted = `${todo.title ? `${todo.title}\n\n` : ""}${todo.content ? todo.content : ""}`;
    shareText(formatted, todo.title);
  }

  onCopy(args: EventData) {
    const todo: ITodo = (args.object as Button).bindingContext;
    const formatted = `${todo.title ? `${todo.title}\n\n` : ""}${todo.content ? todo.content : ""}`;
    setText(formatted);
  }

  async onMoreDataRequested(args: LoadOnDemandListViewEventData) {
    const listView: RadListView = args.object;
    const skip = getOffset(this.pagination.page, this.pagination.limit);
    const [found, count] = await Todo.findAndCount({ skip, take: this.pagination.limit });
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

  async onPullToRefreshInitiated(args: ListViewEventData) {
    const listView = args.object as RadListView;
    const pages = [];
    for (let page = 1; page <= this.pagination.page; page++) {
      const pagination = { ...this.pagination, page };
      const skip = getOffset(pagination.page, pagination.limit);
      const todos = await Todo.find({ skip, take: pagination.limit });
      pages.push(...todos);
    }
    this._todos = new ObservableArray<ITodo>();
    this.todos.push(...pages);
    this.notifyPropertyChange("todos", this.todos);
    listView.notifyPullToRefreshFinished();
  }

  async refreshTodos() {
    const pages = [];
    for (let page = 1; page <= this.pagination.page; page++) {
      const pagination = { ...this.pagination, page };
      const skip = getOffset(pagination.page, pagination.limit);
      const todos = await Todo.find({ skip, take: pagination.limit });
      pages.push(...todos);
    }
    this._todos = new ObservableArray<ITodo>(pages);
    this.notifyPropertyChange("todos", this.todos);
  }

}

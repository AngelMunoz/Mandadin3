import { Observable } from "tns-core-modules/data/observable";
import { Todo } from "~/interfaces/todo.interface";
import { TodoService } from "~/services/todo.service";
import { Frame, EventData } from "@nativescript/core/ui/frame/frame";
import { TextBase } from "@nativescript/core/ui/text-base/text-base";

export class TodosDetailViewModel extends Observable {
  private _todo: Todo;
  constructor(
    todo: Todo,
    private readonly $todos: TodoService,
    private readonly $frame: Frame
  ) {
    super();
    this.todo = { ...todo };
    this.$todos = $todos;
  }

  get todo() {
    return this._todo;
  }

  set todo(todo: Todo) {
    this._todo = { ...todo };
    this.notifyPropertyChange("todo", todo);
  }

  updateProperty(args: EventData) {
    const field = args.object as TextBase;
    switch (field.id) {
      case "title":
        if (this.$todos.exists((args as any).value)) { return; }
        this.todo = { ...this.todo, title: (args as any).value };
        break;
      case "content":
        this.todo = { ...this.todo, content: (args as any).value };
        break;
    }
    this.$todos.update(this.todo);
  }

  deleteTodo() {
    this.$todos.destroy(this.todo.id);
    this.$frame.goBack();
  }
}

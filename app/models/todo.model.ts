import { BaseEntity, PrimaryGeneratedColumn, Column, Entity } from "typeorm/browser";
import { ITodo } from "~/interfaces/todo.interface";

@Entity("todos")
export class Todo extends BaseEntity implements ITodo {

  static titleExists(title: string) {
    return this.count({ where: { title } }).then(count => count > 0);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title?: string;
  @Column()
  content?: string;

  constructor(todo?: Partial<ITodo>) {
    super();
    if (todo) { Object.assign(this, todo); }
  }

}

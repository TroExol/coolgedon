import type { TLog } from '@coolgedon/shared';

interface TLogConstructorParams {
  id: string;
  msg: string;
  date: string;
}

export class Log {
  private readonly id: string;
  private readonly msg: string;
  readonly date: string;

  constructor({
    id,
    msg,
    date,
  }: TLogConstructorParams) {
    this.id = id;
    this.msg = msg;
    this.date = date;
  }

  format(): TLog {
    return {
      id: this.id,
      msg: this.msg,
      date: this.date,
    };
  }
}

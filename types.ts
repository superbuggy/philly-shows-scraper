export interface Book {
  [key: string]: any;
}

export interface Band {
  name: string;
  links: string[];
}

export interface Show {
  dateTime: Date;
  bands: Band[];
  location: string;
  source: string;
  cost: string;
}

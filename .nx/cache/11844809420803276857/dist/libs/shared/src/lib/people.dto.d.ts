import { Person } from "./person.dto";
export interface People {
    totalCount: number;
    averageHeight?: string;
    data: Person[];
}

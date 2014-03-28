///<reference path="bounded_array.ts"/>

enum Result{undefined, changed, unchanged, error, success}
enum Cell_State{undefined = -4, empty = -3, blocked = -2, full = -1}

interface I_Row_Solver{
  solve(description:Bounded_Array, row:Bounded_Array):Result;
}
interface I_Row_Marker{
  mark_from_left(description:Bounded_Array, row:Bounded_Array):Result;
  mark_from_right(description:Bounded_Array, row:Bounded_Array):Result;
  mark_by_size(description:Bounded_Array, row:Bounded_Array):Result;
  mark_by_separation(description:Bounded_Array, row:Bounded_Array):Result;
}
interface I_Marked_Resolver{
  connect_cells_with_same_id(description:Bounded_Array,
      row:Bounded_Array):Result;
  block_edges(description:Bounded_Array,
      row:Bounded_Array):Result;
  block_between_consecutive(description:Bounded_Array,
      row:Bounded_Array):Result;
  expand_marked_fragments(description:Bounded_Array,
      row:Bounded_Array):Result;
}
interface I_Row_Splitter{
  extract_not_marked_parts(description:Bounded_Array, row:Bounded_Array):Tier[];
  merge_rows(base_row:Bounded_Array, added_row:Bounded_Array):void;
}
class Tier{
  constructor(description:Bounded_Array, row:Bounded_Array){
    this.description = description;
    this.row = row;
  }
  description:Bounded_Array;
  row:Bounded_Array;
}

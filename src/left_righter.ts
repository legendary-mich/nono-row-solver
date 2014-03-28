///<reference path="helpers.ts"/>

class Left_Righter implements I_Row_Solver{
  solve(description:Bounded_Array, row:Bounded_Array):Result{
    if(description.length() < 1) return Result.unchanged;

    var result = Result.unchanged;
    var left_row = row.clone();
    var right_row = row.clone();
    var last = row.left_bound - 2;
    var fragments:Fragment[];

    fragments = description.create_description_fragments(left_row);
    for(var i=0; i<fragments.length; ++i){
      fragments[i].move_left_bound_to(last + 2);
      if(fragments[i].found_place_moving_right(is_full_marked_or_empty))
        fragments[i].fill();
      else return Result.error;
      last = fragments[i].right_bound;
    }

    last = row.right_bound + 2;
    fragments = description.create_description_fragments(right_row);

    for(var i=fragments.length - 1; i>=0; --i){
      fragments[i].move_right_bound_to(last - 2);
      if(fragments[i].found_place_moving_left(is_full_marked_or_empty))
        fragments[i].fill();
      last = fragments[i].left_bound;
    }

    left_row.embed(right_row, same_ids_yield_full_cell);
    left_row.embed(row, full_or_b);
    if(!row.array_equals(left_row.array)){
      row.array = left_row.array;
      result = Result.changed;
    }
    return result;
  }
}

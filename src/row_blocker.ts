///<reference path="helpers.ts"/>

class Row_Blocker implements I_Row_Solver{
  solve(description:Bounded_Array, row:Bounded_Array):Result{
    var result = Result.unchanged;
    var smallest_description = description.smallest_value();
    var gaps = row.extract_fragments(is_not_blocked);
    for(var i=0; i<gaps.length; ++i)
      if(gaps[i].length() < smallest_description){
        if(gaps[i].some(is_full_or_marked)) return Result.error;
        gaps[i].value = Cell_State.blocked;
        gaps[i].fill();
        result = Result.changed;
      }

    return result;
  }
}

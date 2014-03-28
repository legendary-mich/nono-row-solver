///<reference path="helpers.ts"/>
///<reference path="row_solver.ts"/>

class Row_Splitter implements I_Row_Solver, I_Row_Splitter{
  constructor(){
    this.splitter = this;
    this.solver = new Row_Solver(new Dummy_Splitter());
  }

  splitter:I_Row_Splitter;
  solver:I_Row_Solver;

  solve(description:Bounded_Array, row:Bounded_Array):Result{
    var result = Result.unchanged;
    var temp_result;
    var not_marked = this.splitter.extract_not_marked_parts(description, row);
    for(var i=0; i<not_marked.length; ++i){
      temp_result = this.solver.solve(
        not_marked[i].description, not_marked[i].row
      );
      if(temp_result == Result.error) return Result.error;
      if(temp_result == Result.changed) result = temp_result;
      this.merge_rows(row, not_marked[i].row);
    }
    return result;
  }

  extract_not_marked_parts(description:Bounded_Array, row:Bounded_Array):Tier[]{
    var result:Tier[] = [];
    var fragments = row.extract_fragments(is_marked);

    if(fragments.length == 0)
      return result;

    //adds guards to fragments so you can easily iterate
    fragments.unshift(Fragment.from_left_bound_and_length(
      row.left_bound - 2, 1, description.left_bound - 1
    ));
    fragments.push(Fragment.from_left_bound_and_length(
      row.right_bound + 2, 1, description.right_bound + 1
    ));

    var temp_desc:Bounded_Array, temp_row:Bounded_Array;
    var left_fragment:Fragment, right_fragment:Fragment;
    var temp_fragment:Fragment;
    var f:Fragment[];

    for(var i=1; i<fragments.length; ++i){
      left_fragment = fragments[i-1];
      right_fragment = fragments[i];

      if(right_fragment.value - left_fragment.value < 2) continue;

      temp_desc = description.clone();
      temp_desc.left_bound = left_fragment.value + 1;
      temp_desc.right_bound = right_fragment.value - 1;

      temp_row = row.clone();
      temp_row.left_bound = left_fragment.right_bound + 2;
      temp_row.right_bound = right_fragment.left_bound - 2;

      temp_fragment = Fragment.from_left_bound_and_length(
          right_fragment.right_bound, 1, Cell_State.empty, temp_row
      ).extend_left_side_until(is_blocked, description.get_or_default(
          right_fragment.value, 1));
      temp_fragment.right_bound = right_fragment.left_bound - 1;
      this.clear_cells_that_could_be_part_of(temp_fragment);

      temp_fragment = Fragment.from_left_bound_and_length(
          left_fragment.left_bound, 1, Cell_State.empty, temp_row
      ).extend_right_side_until(is_blocked, description.get_or_default(
          left_fragment.value, 1));
      temp_fragment.left_bound = left_fragment.right_bound + 1;
      this.clear_cells_that_could_be_part_of(temp_fragment);

      result.push(new Tier(temp_desc,  temp_row));
    }
    return result;
  }
  private clear_cells_that_could_be_part_of(fragment:Fragment):void{
    //fragment.fill(is_full);
    var f = fragment.extract_fully_contained_fragments(is_full);
    f.forEach((element:Fragment, index, array)=>{
      element.value = Cell_State.empty;
      element.fill();
    });
  }
  merge_rows(base_row:Bounded_Array, added_row:Bounded_Array):void{
    base_row.embed(added_row, full_over_empty_or_a);
  }
}
class Dummy_Splitter implements I_Row_Solver{
  solve(description:Bounded_Array, row:Bounded_Array):Result{
    return Result.unchanged;
  }
}

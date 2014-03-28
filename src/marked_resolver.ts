///<reference path="helpers.ts"/>

class Marked_Resolver implements I_Row_Solver, I_Marked_Resolver{

  constructor(){
    this.connector = this;
    this.blocker = this;
    this.expander = this;
  }

  connector:I_Marked_Resolver;
  blocker:I_Marked_Resolver;
  expander:I_Marked_Resolver;

  solve(description:Bounded_Array, row:Bounded_Array):Result{
    var result = Result.unchanged;
    var temp_result:Result;

    temp_result = this.connector.connect_cells_with_same_id(description, row);
    if(temp_result == Result.error) return Result.error;
    if(temp_result == Result.changed) result = Result.changed;

    temp_result = this.blocker.block_edges(description, row);
    if(temp_result == Result.error) return Result.error;
    if(temp_result == Result.changed) result = Result.changed;

    temp_result = this.blocker.block_between_consecutive(description, row);
    if(temp_result == Result.error) return Result.error;
    if(temp_result == Result.changed) result = Result.changed;

    temp_result = this.expander.expand_marked_fragments(description, row);
    if(temp_result == Result.error) return Result.error;
    if(temp_result == Result.changed) result = Result.changed;

    return result;
  }

  connect_cells_with_same_id(description:Bounded_Array,
  row:Bounded_Array):Result{

    var result = Result.unchanged;
    var fragments = row.extract_fragments(is_marked);
    var temp_frag:Fragment;
    for(var i=1; i<fragments.length; ++i){
      if(fragments[i].value == fragments[i-1].value){
        temp_frag = Fragment.from_left_and_right_bounds(
          fragments[i-1].right_bound + 1, fragments[i].left_bound - 1,
          fragments[i].value, row
        );
        if(temp_frag.some(is_blocked))
          return Result.error;
        temp_frag.fill();
        result = Result.changed;
      }
    }
    return result;
  }
  
  block_edges(description:Bounded_Array, row:Bounded_Array):Result{
    var result = Result.unchanged;
    var fragments = row.extract_fragments(is_marked);
    var filler = 
      Fragment.from_left_bound_and_length(0, 1, Cell_State.blocked, row);
    for(var i=0; i<fragments.length; ++i){
      if(fragments[i].length() > description.get(fragments[i].value))
        return Result.error;
      if(fragments[i].length() == description.get(fragments[i].value)){
        filler.move_left_bound_to(fragments[i].left_bound - 1);
        filler.fill();
        filler.move_left_bound_to(fragments[i].right_bound + 1);
        filler.fill();
        result = Result.changed;
      }
    }
    return result;
  }
  
  block_between_consecutive(description:Bounded_Array,
  row:Bounded_Array):Result{
    var result = Result.unchanged;
    var fragments = row.extract_fragments(is_marked);
    if(fragments.length == 0) return result;

    if(fragments[0].left_bound > row.left_bound)
      fragments.unshift(Fragment.from_left_bound_and_length(
        row.left_bound - 1, 1, description.left_bound - 1, row
      ));
    if(fragments[fragments.length - 1].right_bound < row.right_bound)
      fragments.push(Fragment.from_left_bound_and_length(
        row.right_bound + 1, 1, description.right_bound + 1, row
      ));

    var filler:Fragment;
    var max_left:Fragment, max_right:Fragment;
    for(var i=1; i<fragments.length; ++i)
      if(fragments[i].value - fragments[i-1].value == 1){
        max_left = fragments[i-1].clone().extend_right_side_until(is_blocked,
          description.get_or_default(fragments[i-1].value, 1)
        );
        max_right = fragments[i].clone().extend_left_side_until(is_blocked,
          description.get_or_default(fragments[i].value, 1)
        );
        filler = Fragment.from_left_and_right_bounds(
          max_left.right_bound + 1, max_right.left_bound - 1,
          Cell_State.blocked, row
        );
        filler.fill();
        result = Result.changed;
      }
    return result;
  }

  expand_marked_fragments(description:Bounded_Array,
  row:Bounded_Array):Result{
    var result = Result.unchanged;
    var fragments = row.extract_fragments(is_marked);
    var left_band:number, right_band:number;
    var target_length:number;
    for(var i=0; i<fragments.length; ++i){
      target_length = description.get(fragments[i].value);
      fragments[i].extend_left_side_until(is_blocked);
      if(fragments[i].length() < target_length){
        fragments[i].extend_right_side_until(is_blocked, target_length);
        if(fragments[i].length() < target_length)
          return Result.error;
        fragments[i].reduce_left_side_until(is_marked);
        fragments[i].fill();
        result = Result.changed;
      }
      else
        fragments[i].reduce_left_side_until(is_marked);
      fragments[i].extend_right_side_until(is_blocked, target_length);
      if(fragments[i].length() < target_length){
        fragments[i].extend_left_side_until(is_blocked, target_length);
        fragments[i].reduce_right_side_until(is_marked);
        fragments[i].fill();
        result = Result.changed;
      }
    }
    return result;
  }
}

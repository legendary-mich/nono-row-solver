///<reference path="helpers.ts"/>

class Row_Marker implements I_Row_Solver, I_Row_Marker{

  constructor(){
    this.left_marker = this;
    this.right_marker = this;
    this.size_marker = this;
    this.separation_marker = this;
  }

  left_marker:I_Row_Marker;
  right_marker:I_Row_Marker;
  size_marker:I_Row_Marker;
  separation_marker:I_Row_Marker;

  //I_Row_Solver
  solve(description:Bounded_Array, row:Bounded_Array):Result{
    var result = Result.unchanged;
    var temp_result:Result;
    var left_row = row.clone();
    var right_row = row.clone();
    var size_row = row.clone();
    var separation_row = row.clone();

    temp_result = this.left_marker.mark_from_left(description, left_row);
    if(temp_result == Result.error) return Result.error;
    if(temp_result == Result.changed) result = Result.changed;

    temp_result = this.right_marker.mark_from_right(description, right_row);
    if(temp_result == Result.error) return Result.error;
    if(temp_result == Result.changed) result = Result.changed;

    temp_result = this.size_marker.mark_by_size(description, size_row);
    if(temp_result == Result.error) return Result.error;
    if(temp_result == Result.changed) result = Result.changed;

    temp_result = this.separation_marker.mark_by_separation(description,
      separation_row);
    if(temp_result == Result.error) return Result.error;
    if(temp_result == Result.changed) result = Result.changed;

    row.embed(left_row, marked_or_a);
    row.embed(right_row, marked_or_a);
    row.embed(size_row, marked_or_a);
    row.embed(separation_row, marked_or_a);

    return result;
  }
  //I_Row_Marker
  mark_from_left(description:Bounded_Array, row:Bounded_Array):Result{
    var result = Result.unchanged;
    var fragments = description.create_description_fragments(row);
    fragments.unshift(Fragment.from_left_bound_and_length(
          row.left_bound - 2, 1,description.left_bound - 1));
    var current_size:number;
    var xor:Fragment;

    for(var i=1; i<fragments.length; ++i){
      fragments[i].move_left_bound_to(fragments[i-1].right_bound + 2);
      if(fragments[i].found_place_moving_right(is_not_blocked)){
        current_size = fragments[i].length();
        ++fragments[i].right_bound;//checks if it is adjacent to a full cell
        if(!fragments[i].some(is_full)) break;
        fragments[i].reduce_until(is_full).extend_while(is_full);
        if(fragments[i].length() > current_size) return Result.error;
        fragments[i].fill(is_full);
        result = Result.changed;
        xor = fragments[i].clone();
        xor.extend_right_side_until(is_blocked, current_size);
        xor.left_bound = fragments[i].right_bound + 1;
        if(xor.some(is_full)) break;
      }
      else return Result.error;
    }
    return result;
  }
  mark_from_right(description:Bounded_Array, row:Bounded_Array):Result{
    var result = Result.unchanged;
    var fragments = description.create_description_fragments(row);
    fragments.push(Fragment.from_left_bound_and_length(
          row.right_bound + 2, 1, description.right_bound + 1));
    var current_size:number;
    var xor:Fragment;

    for(var i=fragments.length-2; i>=0; --i){
      fragments[i].move_right_bound_to(fragments[i+1].left_bound - 2);
      if(fragments[i].found_place_moving_left(is_not_blocked)){
        current_size= fragments[i].length();
        --fragments[i].left_bound;//checks if it is adjacent to a full cell
        if(!fragments[i].some(is_full)) break;
        fragments[i].reduce_until(is_full).extend_while(is_full);
        if(fragments[i].length() > current_size) return Result.error;
        fragments[i].fill(is_full);
        result = Result.changed;
        xor = fragments[i].clone();
        xor.extend_left_side_until(is_blocked, current_size);
        xor.right_bound = fragments[i].left_bound - 1;
        if(xor.some(is_full)) break;
      }
      else return Result.error;
    }
    return result;
  }
  mark_by_size(description:Bounded_Array, row:Bounded_Array):Result{
    var result = Result.unchanged;
    var fragments = row.extract_fragments(is_full);
    var available_space:Fragment;
    var matching_descriptions:number[];
    for(var i=0; i<fragments.length; ++i){
      available_space = fragments[i].clone();
      available_space.extend_until(is_blocked);
      matching_descriptions = description.get_all_that(inside_bounds(
        fragments[i].length(), available_space.length()
      ));
      if(matching_descriptions.length == 0) return Result.error;
      if(matching_descriptions.length != 1) continue;
      fragments[i].value = description.index_of(matching_descriptions[0]);
      fragments[i].fill();//(is_full);
      result = Result.changed;
    }
    return result;
  }
  mark_by_separation(description:Bounded_Array, row:Bounded_Array):Result{
    var fragments = description.create_description_fragments(row);
    var from = row.left_bound;
    var index:number;
    for(var i=0; i<fragments.length; ++i){
      index = row.first_index(is_full, from);
      if(index == -1) return Result.unchanged;
      fragments[i].move_left_bound_to(index);

      index = row.first_index_not(is_full_or_empty, fragments[i].left_bound);
      if(index <= fragments[i].right_bound)
        fragments[i].move_right_bound_to(index - 1);

      if(row.get(fragments[i].right_bound + 1) == Cell_State.full){
        index = row.last_index_not(is_full, fragments[i].right_bound);
        fragments[i].move_right_bound_to(index - 1);
      }

      if(fragments[i].left_bound < from)
        return Result.unchanged;
      if(fragments[i].some(is_blocked))
        return Result.unchanged;

      from = fragments[i].right_bound + 2;
    }
    if(i == fragments.length){
      for(i=0; i<fragments.length; ++i)
        fragments[i].fill(is_full);
      return Result.changed;
    }
    return Result.unchanged;
  }
}

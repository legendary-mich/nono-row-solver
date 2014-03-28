///<reference path="bounded_array.ts"/>

class Fragment{

  constructor(left_bound:number, right_bound:number, value:number,
  row:Bounded_Array){
    this.left_bound = left_bound;
    this.right_bound = right_bound;
    this.value = value;
    this.row = row;
  }
  clone():Fragment{
    return new Fragment(this.left_bound, this.right_bound, this.value,
        this.row);
  }
  
  left_bound:number;
  right_bound:number;
  value:number;
  row:Bounded_Array;
  length():number{return this.right_bound - this.left_bound + 1;}
  is_valid():boolean{return this.length() > 0;}
  
  static from_left_and_right_bounds(left_bound:number, right_bound:number,
      value:number, row:Bounded_Array = null):Fragment{
    return new Fragment(left_bound, right_bound, value, row);
  }
  static from_left_bound_and_length(left_bound:number, length:number,
      value:number, row:Bounded_Array = null):Fragment{
    return new Fragment(left_bound, left_bound + length - 1, value, row);
  }
  static from_right_bound_and_length(right_bound:number, length:number,
      value:number, row:Bounded_Array = null):Fragment{
    return new Fragment(right_bound - length + 1, right_bound, value, row);
  }

  move(vector:number):void{
    this.left_bound += vector;
    this.right_bound += vector;
  }
  move_left_bound_to(index:number):void{
    var vector = index - this.left_bound;
    this.move(vector);
  }
  move_right_bound_to(index:number):void{
    var vector = index - this.right_bound;
    this.move(vector);
  }
  move_left_until(left_bound_predicate:(v:number)=>boolean,
  right_bound_predicate:(v:number)=>boolean):Fragment{
    var first_left = this.row.last_index(left_bound_predicate,
      this.left_bound - 1);
    if(first_left == -1) first_left = this.row.left_bound - 1;
    ++first_left;

    var first_right = this.row.last_index(right_bound_predicate,
      this.right_bound);
    if(first_right == -1)
      this.move_left_bound_to(first_left)
    else{
      this.move_right_bound_to(first_right);
      if(this.left_bound < first_left)
        this.move_left_bound_to(first_left);
    }
    return this;
  }
  set_length_extending_left_bound(value:number):void{
    this.left_bound = this.right_bound - value + 1;
  }
  set_length_extending_right_bound(value:number):void{
    this.right_bound = this.left_bound + value - 1;
  }
  compute_left_bound(new_right_bound:number):number{
    return new_right_bound - this.length() + 1;
  }
  compute_right_bound(new_left_bound:number):number{
    return new_left_bound + this.length() - 1;
  }
  extend_left_side_while(predicate:(value:number)=>boolean):Fragment{
    var first_not = this.row.last_index_not(predicate, this.left_bound);
    if(first_not == -1) this.left_bound = this.row.left_bound;
    else if(first_not != this.left_bound)
      this.left_bound = first_not + 1;
    return this;
  }
  extend_left_side_until(predicate:(value:number)=>boolean,
  max_length:number = Number.MAX_VALUE):Fragment{
    var first = this.row.last_index(predicate, this.left_bound - 1);
    this.set_length_extending_left_bound(max_length);
    if(first == -1) first = this.row.left_bound - 1;
    this.left_bound = Math.max(first + 1, this.left_bound);
    return this;
  }
  extend_right_side_until(predicate:(value:number)=>boolean,
  max_length:number = Number.MAX_VALUE):Fragment{
    var first = this.row.first_index(predicate, this.right_bound + 1);
    this.set_length_extending_right_bound(max_length);
    if(first == -1) first = this.row.right_bound + 1;
    this.right_bound = Math.min(first - 1, this.right_bound);
    return this;
  }
  extend_until(predicate:(value:number)=>boolean):Fragment{
    this.extend_left_side_until(predicate, Number.MAX_VALUE);
    this.extend_right_side_until(predicate, Number.MAX_VALUE);
    return this;
  }
  extend_right_side_while(predicate:(value:number)=>boolean):Fragment{
    var first_not = this.row.first_index_not(predicate, this.right_bound);
    if(first_not == -1) this.right_bound = this.row.right_bound;
    else if(first_not != this.right_bound)
      this.right_bound = first_not - 1;
    return this;
  }
  extend_while(predicate:(value:number)=>boolean):Fragment{
    this.extend_left_side_while(predicate);
    this.extend_right_side_while(predicate);
    return this;
  }
  reduce_left_side_until(predicate:(value:number)=>boolean):Fragment{
    var first = this.row.first_index(predicate, this.left_bound);
    if(first == -1) this.left_bound = this.right_bound + 1;
    else this.left_bound = first;
    return this;
  }
  reduce_right_side_until(predicate:(value:number)=>boolean):Fragment{
    var first = this.row.last_index(predicate, this.right_bound);
    if(first == -1) this.right_bound = this.left_bound - 1;
    else this.right_bound = first;
    return this;
  }
  reduce_until(predicate:(value:number)=>boolean):Fragment{
    this.reduce_left_side_until(predicate);
    this.reduce_right_side_until(predicate);
    return this;
  }
  fill(predicate:(value:number)=>boolean = null):void{
    var lower = Math.max(this.left_bound, this.row.left_bound);
    var upper = Math.min(this.right_bound, this.row.right_bound);
    if(predicate == null)
      for(var i=lower; i<=upper; ++i)
        this.row.array[i] = this.value;
    else
      for(var i=lower; i<=upper; ++i)
        if(predicate(this.row.array[i]))
          this.row.array[i] = this.value;
  }
  some(predicate:(value:number)=>boolean):boolean{
    var lower = Math.max(this.left_bound, this.row.left_bound);
    var upper = Math.min(this.right_bound, this.row.right_bound);
    for(var i=lower; i<=upper; ++i)
      if(predicate(this.row.array[i]))
        return true;
    return false;
  }
  inside_bounds():boolean{
    return this.left_bound >= this.row.left_bound &&
        this.right_bound <= this.row.right_bound;
  }
  contains(index:number):boolean{
    return index>=this.left_bound && index <=this.right_bound;
  }
  contains_fragment(other:Fragment):boolean{
    return this.contains(other.left_bound) &&
      this.contains(other.right_bound);
  }
  intersects(other:Fragment):boolean{
    return this.left_bound <= other.right_bound &&
      this.right_bound >= other.left_bound;
  }
  product(other:Fragment):Fragment{
    if(!this.intersects(other)) return null;
    return Fragment.from_left_and_right_bounds(
        Math.max(this.left_bound, other.left_bound),
        Math.min(this.right_bound, other.right_bound),
        this.value);
  }
  found_place_moving_right(predicate:(value:number)=>boolean):boolean{
    if(this.right_bound > this.row.right_bound)
      return false;
    this.move_left_bound_to(Math.max(this.left_bound, this.row.left_bound));
    var last_not:number;
    while(true){
      if(this.right_bound > this.row.right_bound) return false;
      last_not = this.row.last_index_not(predicate, this.right_bound);
      if(last_not == -1) return true;
      if(last_not < this.left_bound) return true;
      this.move_left_bound_to(last_not + 1);
    }
  }
  found_place_moving_left(predicate:(value:number)=>boolean):boolean{
    if(this.left_bound < this.row.left_bound)
      return false;
    this.move_right_bound_to(Math.min(this.right_bound, this.row.right_bound));
    var last_not:number;
    while(true){
      if(this.left_bound < this.row.left_bound) return false;
      last_not = this.row.first_index_not(predicate, this.left_bound);
      if(last_not == -1) return true;
      if(last_not > this.right_bound) return true;
      this.move_right_bound_to(last_not - 1);
    }
  }
  extract_fully_contained_fragments(predicate:(value:number)=>boolean):
  Fragment[]{
    var fragments = this.row.extract_fragments(predicate, this.left_bound,
        this.right_bound);
    if(fragments.length > 0 && 
    fragments[0].left_bound < this.left_bound)
      fragments.shift();
    if(fragments.length > 0 && 
    fragments[fragments.length - 1].right_bound > this.right_bound)
      fragments.pop();
    return fragments;
  }
}

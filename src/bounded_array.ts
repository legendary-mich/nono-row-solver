///<reference path="fragment.ts"/>

class Bounded_Array{

  constructor(array:number[] = []){
    this.array = array;
    this.reset_bounds();
  }

  array:number[];
  left_bound:number;
  right_bound:number;
  length():number{return this.right_bound - this.left_bound + 1;}
  is_empty():boolean{return this.length() < 1;}

  set_bounds(lower:number, upper:number):void{
    this.left_bound = lower;
    this.right_bound = upper;
  }
  reset_bounds():void{
    this.left_bound = 0;
    this.right_bound = this.array.length -1;
  }
  get(index:number):number{
    return this.array[index];
  }
  get_or_default(index:number, default_value:number):number{
    if(index < this.left_bound || index > this.right_bound)
      return default_value;
    return this.array[index];
  }
  get_all_that(predicate:(value:number)=>boolean):number[]{
    var result:number[] = [];
    for(var i=this.left_bound; i<=this.right_bound; ++i)
      if(predicate(this.array[i]))
        result.push(this.array[i]);
    return result;
  }
  index_of(value:number):number{
    for(var i=this.left_bound; i<=this.right_bound; ++i)
      if(this.array[i] == value)
        return i;
    return -1;
  }
  clone():Bounded_Array{
    var res = new Bounded_Array(this.array.slice(0));
    res.left_bound = this.left_bound;
    res.right_bound = this.right_bound;
    return res;
  }
  array_equals(other_array:number[]):boolean{
    if(this.array.length != other_array.length) return false;
    for(var i=0; i<this.array.length; ++i)
      if(this.array[i] != other_array[i])
        return false;
    return true;
  }
  equals(other:Bounded_Array):boolean{
    if(other == null) return false;
    if(other.left_bound != this.left_bound) return false;
    if(other.right_bound != this.right_bound) return false;
    for(var i=this.left_bound; i<=this.right_bound; ++i)
      if(this.array[i] != other.array[i])
        return false;
    return true;
  }
  embed(other:Bounded_Array, product:(a:number, b:number)=>number){
    var left_bound = Math.max(this.left_bound, other.left_bound);
    var right_bound = Math.min(this.right_bound, other.right_bound);
    for(var i=left_bound; i<=right_bound; ++i)
      this.array[i] = product(this.array[i], other.array[i]);
  }
  first_index(predicate:(value:number)=>boolean, from = this.left_bound):
  number{
    from = Math.max(from, this.left_bound);
    for(var i=from; i<=this.right_bound; ++i)
      if(predicate(this.array[i]))
        return i;
    return -1;
  }
  last_index(predicate:(value:number)=>boolean, from = this.right_bound):
  number{
    from = Math.min(from, this.right_bound);
    for(var i=from; i>=this.left_bound; --i)
      if(predicate(this.array[i]))
        return i;
    return -1;
  }
  first_index_not(predicate:(value:number)=>boolean, from = this.left_bound):
  number{
    from = Math.max(from, this.left_bound);
    var i = Math.min(from, this.right_bound + 1);
    for(; i<=this.right_bound; ++i)
      if(!predicate(this.array[i]))
        return i;
    return i;
  }
  last_index_not(predicate:(value:number)=>boolean, from = this.right_bound):
  number{
    from = Math.min(from, this.right_bound);
    var i = Math.max(from, this.left_bound - 1);
    for(; i>=this.left_bound; --i)
      if(!predicate(this.array[i]))
        return i;
    return i;
  }
  some(predicate:(value:number)=>boolean):boolean{
    for(var i=this.left_bound; i<=this.right_bound; ++i)
      if(predicate(this.array[i]))
        return true;
    return false;
  }
  every(predicate:(value:number)=>boolean):boolean{
    for(var i=this.left_bound; i<=this.right_bound; ++i)
      if(!predicate(this.array[i]))
        return false;
    return true;
  }
  replace_all_with(predicate:(value:number)=>boolean, value:number):void{
    for(var i=this.left_bound; i<=this.right_bound; ++i)
      if(predicate(this.array[i]))
        this.array[i] = value;
  }
  extract_fragments(predicate:(value:number)=>boolean,
  left_bound = this.left_bound, right_bound = this.right_bound):Fragment[]{
    left_bound = Math.max(left_bound, this.left_bound);
    right_bound = Math.min(right_bound, this.right_bound);
    var result:Fragment[] = [];
    var temp_frag:Fragment;
    for(var i=left_bound; i<=right_bound; ++i)
      if(predicate(this.array[i])){
        temp_frag = Fragment.from_left_bound_and_length(i, 1, this.array[i]);
        temp_frag.row = this;
        temp_frag.extend_while(predicate)
        result.push(temp_frag);
        i = temp_frag.right_bound;
      }
    return result;
  }
  //extract_distinct_fragments(predicate:(value:number)=>boolean):Fragment
  create_description_fragments(underlying_row:Bounded_Array):Fragment[]{
    var result:Fragment[] = [];
    var temp_fragment:Fragment;
    for(var i=this.left_bound; i<=this.right_bound; ++i){
      temp_fragment = Fragment.from_left_bound_and_length(0, this.array[i], i);
      temp_fragment.row = underlying_row;
      result.push(temp_fragment);
    }
    return result;
  }
  smallest_value():number{
    var min = Number.MAX_VALUE;
    for(var i=this.left_bound; i<=this.right_bound; ++i)
      if(this.array[i] < min)
        min = this.array[i];
    return min;
  }
  leftmost_value():number{
    return this.array[this.left_bound];
  }
  rightmost_value():number{
    return this.array[this.right_bound];
  }
  count(predicate:(value:number)=>boolean):number{
    var counter = 0;
    for(var i=this.left_bound; i<=this.right_bound; ++i)
      if(predicate(this.array[i]))
        ++counter;
    return counter;
  }
}

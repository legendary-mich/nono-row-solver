///<reference path="interfaces.ts"/>

function create_row_from_string(description:string):Bounded_Array{
  var char_array = description.split(",");
  var row:number[] = [];
  for(var i=0; i<char_array.length; ++i){
    switch(char_array[i]){
      case "_": row.push(Cell_State.empty); break;
      case "x": row.push(Cell_State.blocked); break;
      case "o": row.push(Cell_State.full); break;
      default: row.push(parseInt(char_array[i]));
    }
  }
  return new Bounded_Array(row);
}
function true_is_true(value:number):boolean{
  return true;
}
function false_is_true(value:number):boolean{
  return false;
}
function is_empty(value:number):boolean{
  return value == Cell_State.empty;
}
function is_full(value:number):boolean{
  return value == Cell_State.full;
}
function is_blocked(value:number):boolean{
  return value == Cell_State.blocked;
}
function is_not_blocked(value:number):boolean{
  return value != Cell_State.blocked;
}
function is_marked(value:number):boolean{
  return value >= 0;
}
function is_full_or_marked(value:number):boolean{
  return value == Cell_State.full || value >= 0;
}
function is_full_or_blocked(value:number):boolean{
  return value == Cell_State.full || value == Cell_State.blocked;
}
function is_full_or_empty(value:number):boolean{
  return value == Cell_State.full || value == Cell_State.empty;
}
function is_blocked_or_marked(value:number):boolean{
  return value == Cell_State.blocked || value >= 0;
}
function is_full_marked_or_empty(value:number):boolean{
  return value == Cell_State.empty || value == Cell_State.full ||
    value >= 0;
}
function is_full_marked_or_blocked(value:number):boolean{
  return value >= 0 || value == Cell_State.full || value == Cell_State.blocked;
}
function inside_bounds(lower:number, higher:number):(value:number)=>boolean{
  return (value:number)=>{return lower <= value && value <= higher;};
}
//products
function full_over_empty_or_a(a:number, b:number):number{
  if(a == Cell_State.empty && b == Cell_State.full) return b;
  return a;
}
function full_or_b(a:number, b:number):number{
  if(a == Cell_State.full) return a;
  return b;
}
function same_ids_yield_full_cell(a:number, b:number):number{
  if(a >= 0 && b == a) return Cell_State.full;
  return Cell_State.undefined;
}
function marked_or_a(a:number, b:number):number{
  if(b >= 0) return b;
  return a;
}
//array
function merge(a:number[], b:number[], product:(a:number, b:number)=>number):
number[]{
  var result:number[] = [];
  for(var i=0; i<a.length; ++i)
    result.push(product(a[i], b[i]));
  return result;
}
//cell state
function cell_state_toString(state:Cell_State):string{
  if(state >= 0) return "marked";
  switch(state){
    case Cell_State.undefined: return "undefined";
    case Cell_State.empty: return "empty";
    case Cell_State.blocked: return "blocked";
    case Cell_State.full: return "full";
    default: return "undefined";
  }
}
function cell_state_fromString(state:string):Cell_State{
  switch(state){
    case "undefined": return Cell_State.undefined;
    case "empty": return Cell_State.empty;
    case "blocked": return Cell_State.blocked;
    case "full": return Cell_State.full;
    default: throw "invalid state: " + state;
  }
}
//result
function result_toString(result:Result):string{
  switch(result){
    case Result.undefined: return "undefined";
    case Result.changed: return "changed";
    case Result.unchanged: return "unchanged";
    case Result.error: return "error";
    //case Result.solved: return "solved";
    default: return "undefined";
  }
}


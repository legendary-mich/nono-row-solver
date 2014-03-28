///<reference path="helpers.ts"/>
///<reference path="row_blocker.ts"/>
///<reference path="row_marker.ts"/>
///<reference path="marked_resolver.ts"/>
///<reference path="row_splitter.ts"/>
///<reference path="left_righter.ts"/>

class Row_Solver implements I_Row_Solver{

  constructor(splitter:I_Row_Solver = new Row_Splitter()){
    this.blocker = new Row_Blocker();
    this.marker = new Row_Marker();
    this.resolver = new Marked_Resolver();
    this.splitter = splitter;
    this.left_righter = new Left_Righter();
  }

  blocker:I_Row_Solver;
  marker:I_Row_Solver;
  resolver:I_Row_Solver;
  splitter:I_Row_Solver;
  left_righter:I_Row_Solver;

  solve(description:Bounded_Array, row:Bounded_Array):Result{
    var result:Result = Result.unchanged;
    var temp_result:Result;

    temp_result = this.blocker.solve(description, row);
    if(temp_result == Result.error) return Result.error;
    else if(temp_result == Result.changed) result = Result.changed;

    temp_result = this.marker.solve(description, row);
    if(temp_result == Result.error) return Result.error;

    temp_result = this.resolver.solve(description, row);
    if(temp_result == Result.error) return Result.error;
    else if(temp_result == Result.changed) result = Result.changed;
    
    temp_result = this.splitter.solve(description, row);
    if(temp_result == Result.error) return Result.error;
    else if(temp_result == Result.changed) result = Result.changed;

    temp_result = this.left_righter.solve(description, row);
    if(temp_result == Result.error) return Result.error;
    else if(temp_result == Result.changed) result = Result.changed;

    row.replace_all_with(is_marked, Cell_State.full);

    return result;
  }
}

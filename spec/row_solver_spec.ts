///<reference path="jasmine.d.ts"/>
///<reference path="../src/row_solver.ts"/>

describe("row solver, solve()", ()=>{
  var row_solver = new Row_Solver();
  row_solver.blocker = {solve(desc, row){return Result.unchanged;}};
  row_solver.marker = {solve(desc, row){ return Result.unchanged;}};
  row_solver.resolver = {solve(desc, row){return Result.unchanged;}};
  row_solver.splitter = {solve(desc, row){return Result.unchanged;}};
  row_solver.left_righter = {solve(desc, row){return Result.unchanged;}};
  function set_solvers_to_return(blocker:Result, marker:Result, resolver:Result,
    splitter:Result, left_righter:Result){
      spyOn(row_solver.blocker, "solve").and.returnValue(blocker);
      spyOn(row_solver.marker, "solve").and.returnValue(marker);
      spyOn(row_solver.resolver, "solve").and.returnValue(resolver);
      spyOn(row_solver.splitter, "solve").and.returnValue(splitter);
      spyOn(row_solver.left_righter, "solve").and.returnValue(left_righter);
  }
  function set_all_solvers_to_return(result:Result){
    set_solvers_to_return(result, result, result, result, result);
  }
  function set_all_but_one_to_return(all_result:Result, one_result:Result,
    one_name:string):void{
    switch(one_name){
      case "blocker": set_solvers_to_return(one_result, all_result, all_result,
                          all_result, all_result); break;
      case "marker": set_solvers_to_return(all_result, one_result, all_result,
                          all_result, all_result); break;
      case "resolver": set_solvers_to_return(all_result, all_result, one_result,
                          all_result, all_result); break;
      case "splitter": set_solvers_to_return(all_result, all_result, all_result,
                          one_result, all_result); break;
      case "left_righter": set_solvers_to_return(all_result, all_result,
                               all_result, all_result, one_result); break;
      default: throw "row_solver_spec.ts, set_all_but_one_to_return,\
               invalid one_name";
    }
  }
  it("should return 'unchanged' when all internal solvers return 'unchanged'", ()=>{
    set_all_solvers_to_return(Result.unchanged);
    var res = row_solver.solve(new Bounded_Array, new Bounded_Array);
    expect(res).toBe(Result.unchanged);
  });
  it("should return 'unchanged' even if marker returns 'changed'", ()=>{
    set_all_but_one_to_return(Result.unchanged, Result.changed, "marker");
    var res = row_solver.solve(new Bounded_Array, new Bounded_Array);
    expect(res).toBe(Result.unchanged);
  });
  it("should return 'changed' when blocker returns 'changed'", ()=>{
    set_all_but_one_to_return(Result.unchanged, Result.changed, "blocker");
    var res = row_solver.solve(new Bounded_Array, new Bounded_Array);
    expect(res).toBe(Result.changed);
  });
  it("should return 'changed' when resolver returns 'changed'", ()=>{
    set_all_but_one_to_return(Result.unchanged, Result.changed, "resolver");
    var res = row_solver.solve(new Bounded_Array, new Bounded_Array);
    expect(res).toBe(Result.changed);
  });
  it("should return 'changed' when splitter returns 'changed'", ()=>{
    set_all_but_one_to_return(Result.unchanged, Result.changed, "splitter");
    var res = row_solver.solve(new Bounded_Array, new Bounded_Array);
    expect(res).toBe(Result.changed);
  });
  it("should return 'changed' when left_righter returns 'changed'", ()=>{
    set_all_but_one_to_return(Result.unchanged, Result.changed, "left_righter");
    var res = row_solver.solve(new Bounded_Array, new Bounded_Array);
    expect(res).toBe(Result.changed);
  });
  it("should return 'error' when blocker returns 'error'", ()=>{
    set_all_but_one_to_return(Result.changed, Result.error, "blocker");
    var res = row_solver.solve(new Bounded_Array, new Bounded_Array);
    expect(res).toBe(Result.error);
  });
  it("should return 'error' when marker returns 'error'", ()=>{
    set_all_but_one_to_return(Result.changed, Result.error, "marker");
    var res = row_solver.solve(new Bounded_Array, new Bounded_Array);
    expect(res).toBe(Result.error);
  });
  it("should return 'error' when resolver returns 'error'", ()=>{
    set_all_but_one_to_return(Result.changed, Result.error, "resolver");
    var res = row_solver.solve(new Bounded_Array, new Bounded_Array);
    expect(res).toBe(Result.error);
  });
  it("should return 'error' when splitter returns 'error'", ()=>{
    set_all_but_one_to_return(Result.changed, Result.error, "splitter");
    var res = row_solver.solve(new Bounded_Array, new Bounded_Array);
    expect(res).toBe(Result.error);
  });
  it("should return 'error' when left_righter returns 'error'", ()=>{
    set_all_but_one_to_return(Result.changed, Result.error, "left_righter");
    var res = row_solver.solve(new Bounded_Array, new Bounded_Array);
    expect(res).toBe(Result.error);
  });
  it("should forward arguments to blocker", ()=>{
    var description = new Bounded_Array([23984848786]);
    var row = new Bounded_Array([737828792]);
    spyOn(row_solver.blocker, "solve");
    row_solver.solve(description, row);
    expect(row_solver.blocker.solve).toHaveBeenCalledWith(description, row);
  });
  it("should forward arguments to marker", ()=>{
    var description = new Bounded_Array([23984848786]);
    var row = new Bounded_Array([737828792]);
    spyOn(row_solver.marker, "solve");
    row_solver.solve(description, row);
    expect(row_solver.marker.solve).toHaveBeenCalledWith(description, row);
  });
  it("should forward arguments to resolver", ()=>{
    var description = new Bounded_Array([23984848786]);
    var row = new Bounded_Array([737828792]);
    spyOn(row_solver.resolver, "solve");
    row_solver.solve(description, row);
    expect(row_solver.resolver.solve).toHaveBeenCalledWith(description, row);
  });
  it("should forward arguments to splitter", ()=>{
    var description = new Bounded_Array([23984848786]);
    var row = new Bounded_Array([737828792]);
    spyOn(row_solver.splitter, "solve");
    row_solver.solve(description, row);
    expect(row_solver.splitter.solve).toHaveBeenCalledWith(description, row);
  });
  it("should forward arguments to left_righter", ()=>{
    var description = new Bounded_Array([23984848786]);
    var row = new Bounded_Array([737828792]);
    spyOn(row_solver.left_righter, "solve");
    row_solver.solve(description, row);
    expect(row_solver.left_righter.solve).toHaveBeenCalledWith(description, row);
  });
  it("should change all marked cells to full cells", ()=>{
    var row = create_row_from_string("_,_,_,_,_,x,o,x,3");
    var expected = create_row_from_string("o,o,o,o,o,x,o,x,o");
    row_solver.blocker.solve = (a,row:Bounded_Array)=>{
      row.array[0] = 0; return Result.changed;
    };
    row_solver.marker.solve = (a,row:Bounded_Array)=>{
      row.array[1] = 1; return Result.changed;
    };
    row_solver.resolver.solve = (a,row:Bounded_Array)=>{
      row.array[2] = 2; return Result.changed;
    };
    row_solver.splitter.solve = (a,row:Bounded_Array)=>{
      row.array[3] = 3; return Result.changed;
    };
    row_solver.left_righter.solve = (a,row:Bounded_Array)=>{
      row.array[4] = 4; return Result.changed;
    };
    row_solver.solve(new Bounded_Array, row);
    expect(row.array_equals(expected.array)).toBe(true);
  });
});

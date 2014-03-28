///<reference path="jasmine.d.ts"/>
///<reference path="../src/row_blocker.ts"/>

describe("row blocker, solve()", ()=>{
  var row_blocker = new Row_Blocker();
  it("should block all gaps smaller than smallest description", ()=>{
    var description = new Bounded_Array([3, 4, 2]);
    var row = create_row_from_string("_,x,_,_,x,_,_,_,x,_");
    var expected_row = create_row_from_string("x,x,_,_,x,_,_,_,x,x");
    var result = row_blocker.solve(description, row);
    expect(result).toBe(Result.changed);
    expect(row.array_equals(expected_row.array)).toBe(true);
  });
  it("should not block gaps if they're outside bounds", ()=>{
    var description = new Bounded_Array([3]);
    var row = create_row_from_string("_,x,x,_");
    var expected_row = create_row_from_string("_,x,x,_");
    row.left_bound = 1; row.right_bound = 2;
    var result = row_blocker.solve(description, row);
    expect(result).toBe(Result.unchanged);
    expect(row.array_equals(expected_row.array)).toBe(true);
  });
  it("should not take into account descriptions that are outside bounds", ()=>{
    var description = new Bounded_Array([2, 3, 2]);
    description.left_bound = 1; description.right_bound = 1;
    var row = create_row_from_string("_,x,_,_,x,_,_,_,x,_");
    var expected_row = create_row_from_string("x,x,x,x,x,_,_,_,x,x");
    row_blocker.solve(description, row);
    expect(row.array_equals(expected_row.array)).toBe(true);
  });
  it("should return 'error' if smaller gap has full cell", ()=>{
    var description = new Bounded_Array([3]);
    var row = create_row_from_string("_,x,o,_,x,_,_,_,x,x");
    var result = row_blocker.solve(description, row);
    expect(result).toBe(Result.error);
  });
  it("should return 'error' if smaller gap has marked cell", ()=>{
    var description = new Bounded_Array([3]);
    var row = create_row_from_string("_,x,1,_,x,_,_,_,x,x");
    var result = row_blocker.solve(description, row);
    expect(result).toBe(Result.error);
  });
});

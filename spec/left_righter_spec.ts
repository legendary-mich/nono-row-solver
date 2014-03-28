///<reference path="jasmine.d.ts"/>
///<reference path="../src/left_righter.ts"/>

describe("left-righter", ()=>{
  var left_righter = new Left_Righter();
  it("should find nothing if description is  too sparse", ()=>{
    var description = new Bounded_Array([2,1]);
    var row = create_row_from_string("_,_,_,_,_,_");
    var expected = create_row_from_string("_,_,_,_,_,_");
    var result = left_righter.solve(description, row);
    expect(result).toBe(Result.unchanged);
    expect(row.array_equals(expected.array)).toBe(true);
  });
  it("should find full fragments if they fill all available space", ()=>{
    var description = new Bounded_Array([2,4,3]);
    var row = create_row_from_string("_,_,_,_,_,_,_,_,_,_,_")
    var expected = create_row_from_string("o,o,_,o,o,o,o,_,o,o,o");
    var result = left_righter.solve(description, row);
    expect(result).toBe(Result.changed);
    expect(row.array_equals(expected.array)).toBe(true);
  });
  it("should take description's bounds into account", ()=>{
    var description = new Bounded_Array([2,4,3]);
    description.left_bound = description.right_bound = 1;
    var row = create_row_from_string("_,_,_,_")
    var expected = create_row_from_string("o,o,o,o");
    var result = left_righter.solve(description, row);
    expect(result).toBe(Result.changed);
    expect(row.array_equals(expected.array)).toBe(true);
  });
  it("should take row's bounds into account", ()=>{
    var description = new Bounded_Array([3]);
    var row = create_row_from_string("_,_,_,_,_")
    var expected = create_row_from_string("_,o,o,o,_");
    row.left_bound = 1; row.right_bound = 3;
    var result = left_righter.solve(description, row);
    expect(result).toBe(Result.changed);
    expect(row.array_equals(expected.array)).toBe(true);
  });
  it("should take blocked cells into account", ()=>{
    var description = new Bounded_Array([2,3]);
    var row = create_row_from_string("_,x,_,_,_,x,_,_,_,_,x");
    var expected = create_row_from_string("_,x,_,o,_,x,_,o,o,_,x");
    var result = left_righter.solve(description, row);
    expect(result).toBe(Result.changed);
    expect(row.array_equals(expected.array)).toBe(true);
  });
  it("should work with full cells", ()=>{
    var description = new Bounded_Array([3]);
    var row = create_row_from_string("o,o,_,_")
    var expected = create_row_from_string("o,o,o,_")
    var result = left_righter.solve(description, row);
    expect(result).toBe(Result.changed);
    expect(row.array_equals(expected.array)).toBe(true);
  });
  it("should work with marked cells", ()=>{
    var description = new Bounded_Array([3]);
    var row = create_row_from_string("1,1,_,_")
    var expected = create_row_from_string("1,o,o,_")
    var result = left_righter.solve(description, row);
    expect(result).toBe(Result.changed);
    expect(row.array_equals(expected.array)).toBe(true);
  });
  it("should return 'error' if there's not enough space for all fragments",()=>{
    var description = new Bounded_Array([2,3]);
    var row = create_row_from_string("_,_,_,_,_");
    var result = left_righter.solve(description, row);
    expect(result).toBe(Result.error);
  });
});

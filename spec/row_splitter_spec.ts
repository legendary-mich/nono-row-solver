///<reference path="jasmine.d.ts"/>
///<reference path="../src/row_splitter.ts"/>

describe("row splitter", ()=>{
  describe("extract_not_marked_parts()", ()=>{
    var splitter:I_Row_Splitter = new Row_Splitter();
    it("should return an empty array when there are no marked fragments", ()=>{
      var description = new Bounded_Array([2,1]);
      var row = create_row_from_string("_,_,o,o,x,x,o,_,_");
      var result = splitter.extract_not_marked_parts(description, row);
      expect(result.length).toEqual(0);
    });
    it("should extract a gap between the left edge and the first marked\
    fragment, if that fragment's value differs from the leftmost description",
    ()=>{
      var description = new Bounded_Array([2,3]);
      var row = create_row_from_string("_,_,o,_,x,x,1,_,_");
      var expected_desc = new Bounded_Array([2]);
      var expected_row = create_row_from_string("_,_,o,_,x");
      var result = splitter.extract_not_marked_parts(description, row);
      expect(result.length).toEqual(1);
      expect(result[0].description.equals(expected_desc)).toBe(true);
      expect(result[0].row.equals(expected_row)).toBe(true);
    });
    it("should extract a gap between the last marked fragment and the right\
    edge, if the fragment's value differs from the rightmost description", ()=>{
      var description = new Bounded_Array([2,3]);
      var row = create_row_from_string("_,_,0,_,x,x,o,_,_");
      var expected_desc = new Bounded_Array([2,3]);
      expected_desc.left_bound = 1;
      var expected_row = create_row_from_string("_,_,_,_,x,x,o,_,_");
      expected_row.left_bound = 4;
      var result = splitter.extract_not_marked_parts(description, row);
      expect(result.length).toEqual(1);
      expect(result[0].description.equals(expected_desc)).toBe(true);
      expect(result[0].row.equals(expected_row)).toBe(true);
    });
    it("should extract a gap between two not adjacent fragments", ()=>{
      var description = new Bounded_Array([2,3,2]);
      var row = create_row_from_string("_,_,0,_,x,x,o,_,2");
      var expected_desc = new Bounded_Array([2,3,2]);
      expected_desc.left_bound = expected_desc.right_bound = 1;
      var expected_row = create_row_from_string("_,_,_,_,x,x,o,_,_");
      expected_row.left_bound = 4;
      expected_row.right_bound = 6;
      var result = splitter.extract_not_marked_parts(description, row);
      expect(result.length).toEqual(1);
      expect(result[0].description.equals(expected_desc)).toBe(true);
      expect(result[0].row.equals(expected_row)).toBe(true);
    });
    it("should extract no gap if fragments are adjacent to each other", ()=>{
      var description = new Bounded_Array([2,3]);
      var row = create_row_from_string("_,_,0,_,x,x,1,_,_");
      var expected_desc = new Bounded_Array([2,3]);
      var result = splitter.extract_not_marked_parts(description, row);
      expect(result.length).toEqual(0);
    });
    it("should not affect an original description nor an original row", ()=>{
      var description = new Bounded_Array([2,3]);
      var row = create_row_from_string("_,_,o,_,x,x,1,_,_");
      var expected_desc = description.clone();
      var expected_row = row.clone();
      splitter.extract_not_marked_parts(description, row);
      expect(description.equals(expected_desc)).toBe(true);
      expect(row.equals(expected_row)).toBe(true);
    });
    it("should clear full cells that could potentially be part of the right\
    fragment", ()=>{
      var description = new Bounded_Array([2,3]);
      var row = create_row_from_string("_,_,o,_,o,_,1,_,_");
      var expected_row = create_row_from_string("_,_,o,_,_,_,1");
      expected_row.right_bound = 4;
      var result = splitter.extract_not_marked_parts(description, row);
      expect(result[0].row.equals(expected_row)).toBe(true);
    });
    it("should not clear full cells that could potentially be part of the right\
    fragment, if they actualy can't be, because of they are partially outside",
    ()=>{
      var description = new Bounded_Array([2,3]);
      var row = create_row_from_string("_,_,o,o,o,_,1,_,_");
      var expected_row = create_row_from_string("_,_,o,o,o,_,1");
      expected_row.right_bound = 4;
      var result = splitter.extract_not_marked_parts(description, row);
      expect(result[0].row.equals(expected_row)).toBe(true);
    });
    it("should clear full cells that could potentially be part of the left\
    fragment", ()=>{
      var description = new Bounded_Array([3,3]);
      var row = create_row_from_string("_,_,0,_,o,_,o,_,_");
      var expected_row = create_row_from_string("_,_,0,_,_,_,o,_,_");
      expected_row.left_bound = 4;
      var result = splitter.extract_not_marked_parts(description, row);
      expect(result[0].row.equals(expected_row)).toBe(true);
    });
    it("should not clear full cells that could potentially be part of the left\
    fragment, if they actualy can't be, because of they are partially outside",
    ()=>{
      var description = new Bounded_Array([3,3]);
      var row = create_row_from_string("_,_,0,_,o,o,o,_,_");
      var expected_row = create_row_from_string("_,_,0,_,o,o,o,_,_");
      expected_row.left_bound = 4;
      var result = splitter.extract_not_marked_parts(description, row);
      expect(result[0].row.equals(expected_row)).toBe(true);
    });
  });
  describe("solve()", ()=>{
    function create_tiers():Tier[]{
      return [new Tier(new Bounded_Array([1,1]), new Bounded_Array([1,2])),
              new Tier(new Bounded_Array([2,1]), new Bounded_Array([2,2])),
              new Tier(new Bounded_Array([3,1]), new Bounded_Array([3,2])),
              new Tier(new Bounded_Array([4,1]), new Bounded_Array([4,2]))];
    }
    var main_solver = new Row_Splitter();
    var splitter = main_solver.splitter;
    var solver = main_solver.solver;
    it("should forward arguments to a splitter", ()=>{
      spyOn(splitter, "extract_not_marked_parts").and.returnValue([]);
      var description = new Bounded_Array([3344]);
      var row = new Bounded_Array([34,332]);
      main_solver.solve(description ,row);
      expect(splitter.extract_not_marked_parts).toHaveBeenCalledWith(
        description, row
      );
    });
    it("should call solver solve, for each of splitter's return values", ()=>{
      var tiers:Tier[] = create_tiers();

      spyOn(splitter, "extract_not_marked_parts").and.returnValue(tiers);
      spyOn(solver, "solve");
      var description = new Bounded_Array([3344]);
      var row = new Bounded_Array([34,332]);
      main_solver.solve(description ,row);
      expect(solver.solve).toHaveBeenCalledWith(
        tiers[0].description, tiers[0].row
      );
      expect(solver.solve).toHaveBeenCalledWith(
        tiers[1].description, tiers[1].row
      );
      expect(solver.solve).toHaveBeenCalledWith(
        tiers[2].description, tiers[2].row
      );
      expect(solver.solve).toHaveBeenCalledWith(
        tiers[3].description, tiers[3].row
      );
    });
    it("should call merge rows, for each of splitter's return values", ()=>{
      var tiers:Tier[] = create_tiers();

      spyOn(splitter, "extract_not_marked_parts").and.returnValue(tiers);
      spyOn(solver, "solve");
      spyOn(splitter, "merge_rows");
      var description = new Bounded_Array([3344]);
      var row = new Bounded_Array([34,332]);
      main_solver.solve(description ,row);
      expect(splitter.merge_rows).toHaveBeenCalledWith(
        row, tiers[0].row
      );
      expect(splitter.merge_rows).toHaveBeenCalledWith(
        row, tiers[1].row
      );
      expect(splitter.merge_rows).toHaveBeenCalledWith(
        row, tiers[2].row
      );
      expect(splitter.merge_rows).toHaveBeenCalledWith(
        row, tiers[3].row
      );
    });
    it("should return 'unchanged' if splitter returns an empty array", ()=>{
      var tiers:Tier[] = [];
      spyOn(splitter, "extract_not_marked_parts").and.returnValue(tiers);
      var description = new Bounded_Array([]);
      var row = new Bounded_Array([]);
      var result = main_solver.solve(description ,row);
      expect(result).toBe(Result.unchanged);
    });
    it("should return 'unchanged' if all extracted fragments return\
    'unchanged'", ()=>{
      var tiers = create_tiers();
      spyOn(splitter, "extract_not_marked_parts").and.returnValue(tiers);
      spyOn(solver, "solve").and.returnValue(Result.unchanged);
      spyOn(splitter, "merge_rows");
      var description = new Bounded_Array([]);
      var row = new Bounded_Array([]);
      expect(main_solver.solve(description ,row)).toBe(Result.unchanged);
    });
    it("should return 'changed if almost one extracted fragment returns\
    'changed", ()=>{
      var tiers = create_tiers();
      spyOn(splitter, "extract_not_marked_parts").and.returnValue(tiers);
      main_solver.solver = {solve(desc, row){
        if(row === tiers[2].row) return Result.changed;
        return Result.unchanged;
      }};
      spyOn(solver, "solve");
      spyOn(splitter, "merge_rows");
      var description = new Bounded_Array([]);
      var row = new Bounded_Array([]);
      expect(main_solver.solve(description ,row)).toBe(Result.changed);
    });
    it("should return 'error' if almost one extracted fragment returns 'error'",
    ()=>{
      var tiers = create_tiers();
      spyOn(splitter, "extract_not_marked_parts").and.returnValue(tiers);
      main_solver.solver = {solve(desc, row){
        if(row === tiers[1].row) return Result.error;
        return Result.unchanged;
      }};
      spyOn(solver, "solve");
      spyOn(splitter, "merge_rows");
      var description = new Bounded_Array([]);
      var row = new Bounded_Array([]);
      expect(main_solver.solve(description ,row)).toBe(Result.error);
    });
  });
  describe("merge()", ()=>{
    var splitter:I_Row_Splitter = new Row_Splitter();
    it("should replace empty cells whith full cells",()=>{
      var base_row = create_row_from_string("_,_,_,x,o,o,o");
      var added_row = create_row_from_string("o,o,o,x,_,_,_");
      var expected = create_row_from_string("o,o,o,x,o,o,o");
      splitter.merge_rows(base_row, added_row);
      expect(base_row.equals(expected)).toBe(true);
    });
  });
});

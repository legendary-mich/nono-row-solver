///<reference path="jasmine.d.ts"/>
///<reference path="../src/row_marker.ts"/>

describe("row marker", ()=>{
  describe("solve()", ()=>{
    var marker = new Row_Marker();
    function set_markers_to_return(left_marker:Result, right_marker:Result,
      size_marker:Result, separation_marker:Result){
        spyOn(marker.left_marker, "mark_from_left").and.
          returnValue(left_marker);
        spyOn(marker.right_marker, "mark_from_right").and.
          returnValue(right_marker);
        spyOn(marker.size_marker, "mark_by_size").and.
          returnValue(size_marker);
        spyOn(marker.separation_marker, "mark_by_separation").and.
          returnValue(separation_marker);
    }
    function set_all_markers_to_return(result:Result){
      set_markers_to_return(result, result, result, result);
    }
    function set_all_but_one_to_return(all_result:Result, one_result:Result,
      one_name:string):void{
      switch(one_name){
        case "left_marker": set_markers_to_return(one_result, all_result,
                              all_result, all_result); break;
        case "right_marker": set_markers_to_return(all_result, one_result,
                                 all_result, all_result); break;
        case "size_marker": set_markers_to_return(all_result, all_result,
                                one_result, all_result); break;
        case "separation_marker": set_markers_to_return(all_result, all_result,
                                      all_result, one_result); break;
        default: throw "row_solver_spec.ts, set_all_but_one_to_return,\
                 invalid one_name";
      }
    }
    it("should return 'unchanged' when all markers return 'unchanged'", ()=>{
      set_all_markers_to_return(Result.unchanged);
      var result = marker.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.unchanged);
    });
    it("should return 'changed' when left marker returns 'changed'", ()=>{
      set_all_but_one_to_return(Result.unchanged, Result.changed,
        "left_marker");
      var result = marker.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.changed);
    });
    it("should return 'changed' when right marker returns 'changed'", ()=>{
      set_all_but_one_to_return(Result.unchanged, Result.changed,
        "right_marker");
      var result = marker.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.changed);
    });
    it("should return 'changed' when size marker returns 'changed'", ()=>{
      set_all_but_one_to_return(Result.unchanged, Result.changed,
        "size_marker");
      var result = marker.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.changed);
    });
    it("should return 'changed' when separation marker returns 'changed'", ()=>{
      set_all_but_one_to_return(Result.unchanged, Result.changed,
        "separation_marker");
      var result = marker.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.changed);
    });
    it("should return 'error' when left marker returns 'error'", ()=>{
      set_all_but_one_to_return(Result.changed, Result.error,
        "left_marker");
      var result = marker.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.error);
    });
    it("should return 'error' when right marker returns 'error'", ()=>{
      set_all_but_one_to_return(Result.changed, Result.error,
        "right_marker");
      var result = marker.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.error);
    });
    it("should return 'error' when size marker returns 'error'", ()=>{
      set_all_but_one_to_return(Result.changed, Result.error,
        "size_marker");
      var result = marker.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.error);
    });
    it("should return 'error' when separation marker returns 'error'", ()=>{
      set_all_but_one_to_return(Result.changed, Result.error,
        "separation_marker");
      var result = marker.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.error);
    });
    it("internal markers should work with row's clones", ()=>{
      var row = create_row_from_string("_,_,_,_");
      var expected = create_row_from_string("_,_,_,_");
      marker.left_marker.mark_from_left = (a, row:Bounded_Array)=>{
        row.array[0] = Cell_State.blocked; return Result.changed;
      };
      marker.right_marker.mark_from_right = (a, row:Bounded_Array)=>{
        row.array[1] = Cell_State.blocked; return Result.changed;
      };
      marker.size_marker.mark_by_size = (a, row:Bounded_Array)=>{
        row.array[2] = Cell_State.blocked; return Result.changed;
      };
      marker.separation_marker.mark_by_separation = (a, row:Bounded_Array)=>{
        row.array[3] = Cell_State.blocked; return Result.changed;
      };
      marker.solve(new Bounded_Array(), row);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should merge rows from all internal markers", ()=>{
      var row = create_row_from_string("o,x,o,x,o,x,o");
      var expected = create_row_from_string("0,x,1,x,2,x,3");
      marker.left_marker.mark_from_left = (a, row:Bounded_Array)=>{
        row.array[0] = 0; return Result.changed;
      };
      marker.right_marker.mark_from_right = (a, row:Bounded_Array)=>{
        row.array[2] = 1; return Result.changed;
      };
      marker.size_marker.mark_by_size = (a, row:Bounded_Array)=>{
        row.array[4] = 2; return Result.changed;
      };
      marker.separation_marker.mark_by_separation = (a, row:Bounded_Array)=>{
        row.array[6] = 3; return Result.changed;
      };
      marker.solve(new Bounded_Array(), row);
      expect(row.array_equals(expected.array)).toBe(true);
    });
  });
  describe("mark_from_left()", ()=>{
    var marker = new Row_Marker();
    it("should return 'unchanged' when there are no full cells" , ()=>{
      var description = new Bounded_Array([1,2,2]);
      var row = create_row_from_string("_,_,_,_,_,_,_,_");
      var expected = create_row_from_string("_,_,_,_,_,_,_,_");
      var result = marker.mark_from_left(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should mark all fragments if they're separated with one not full cell",
    ()=>{
      var description = new Bounded_Array([1,3,2]);
      var row = create_row_from_string("o,x,o,o,o,_,o,o");
      var expected = create_row_from_string("0,x,1,1,1,_,2,2");
      var result = marker.mark_from_left(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should take description boundaries into account", ()=>{
      var description = new Bounded_Array([100,1,3,2,100]);
      var row = create_row_from_string("o,x,o,o,o,_,o,o");
      var expected = create_row_from_string("1,x,2,2,2,_,3,3");
      description.left_bound = 1;
      description.right_bound = 3;
      var result = marker.mark_from_left(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should take row boundaries into account", ()=>{
      var description = new Bounded_Array([1,3]);
      var row = create_row_from_string("o,x,o,x,o,o,o,_,o,o");
      var expected = create_row_from_string("o,x,0,x,1,1,1,_,o,o");
      row.left_bound = 1;
      row.right_bound = 7;
      var result = marker.mark_from_left(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should mark all fragments even if they're shorter than descriptions",
    ()=>{
      var description = new Bounded_Array([1,3,2]);
      var row = create_row_from_string("o,x,_,o,o,_,o,_");
      var expected = create_row_from_string("0,x,_,1,1,_,2,_");
      var result = marker.mark_from_left(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should mark entire fragments", ()=>{
      var description = new Bounded_Array([1,3]);
      var row = create_row_from_string("o,x,_,_,o,o,o,_");
      var expected = create_row_from_string("0,x,_,_,1,1,1,_");
      var result = marker.mark_from_left(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should match fragments which stick to the the right bound", ()=>{
      var description = new Bounded_Array([1,3]);
      var row = create_row_from_string("o,x,_,_,_,o,o,_");
      var expected = create_row_from_string("0,x,_,_,_,1,1,_");
      var result = marker.mark_from_left(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should break a chain if some fragment doesn't sitck to or doesn't\
    contain a full cell", ()=>{
      var description = new Bounded_Array([1,2,2]);
      var row = create_row_from_string("o,x,_,_,_,o,o,_");
      var expected = create_row_from_string("0,x,_,_,_,o,o,_");
      var result = marker.mark_from_left(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should break a chain if a next full cell could belong to this fragment",
    ()=>{
      var description = new Bounded_Array([5,2]);
      var row = create_row_from_string("_,_,o,_,_,_,o,_,_");
      var expected = create_row_from_string("_,_,0,_,_,_,o,_,_");
      var result = marker.mark_from_left(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should not break a chain if a next full cell could belong to this\
    fragment, unless it was blocked first", ()=>{
      var description = new Bounded_Array([4,2]);
      var row = create_row_from_string("_,_,o,_,x,o,o,_");
      var expected = create_row_from_string("_,_,0,_,x,1,1,_");
      var result = marker.mark_from_left(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should return 'error' if any fragment don't fit in a row" , ()=>{
      var description = new Bounded_Array([1,2]);
      var row = create_row_from_string("_,o,x,_");
      var result = marker.mark_from_left(description, row);
      expect(result).toBe(Result.error);
    });
    it("should return 'error' if some fragment is bigger than description",
    ()=>{
      var description = new Bounded_Array([1,2]);
      var row = create_row_from_string("_,o,x,_,o,o,o");
      var result = marker.mark_from_left(description, row);
      expect(result).toBe(Result.error);
    });
  });
  describe("mark_from_right()", ()=>{
    var marker = new Row_Marker();
    it("should return 'unchanged' when there are no full cells" , ()=>{
      var description = new Bounded_Array([1,2,2]);
      var row = create_row_from_string("_,_,_,_,_,_,_,_");
      var expected = create_row_from_string("_,_,_,_,_,_,_,_");
      var result = marker.mark_from_right(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should mark all fragments if they're separated with one not full cell",
    ()=>{
      var description = new Bounded_Array([1,3,2]);
      var row = create_row_from_string("o,x,o,o,o,_,o,o");
      var expected = create_row_from_string("0,x,1,1,1,_,2,2");
      var result = marker.mark_from_right(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should take description boundaries into account", ()=>{
      var description = new Bounded_Array([100,1,3,2,100]);
      var row = create_row_from_string("o,x,o,o,o,_,o,o");
      var expected = create_row_from_string("1,x,2,2,2,_,3,3");
      description.left_bound = 1;
      description.right_bound = 3;
      var result = marker.mark_from_right(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should take row boundaries into account", ()=>{
      var description = new Bounded_Array([3,2]);
      var row = create_row_from_string("o,x,o,o,o,_,o,o,x,o,o");
      var expected = create_row_from_string("o,x,0,0,0,_,1,1,x,o,o");
      row.left_bound = 1;
      row.right_bound = 8;
      var result = marker.mark_from_right(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should mark all fragments even if they're shorter than descriptions",
    ()=>{
      var description = new Bounded_Array([1,3,2]);
      var row = create_row_from_string("o,x,_,o,o,_,o,_");
      var expected = create_row_from_string("0,x,_,1,1,_,2,_");
      var result = marker.mark_from_right(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should mark entire fragments", ()=>{
      var description = new Bounded_Array([2,3]);
      var row = create_row_from_string("o,o,_,_,o,o,o,_");
      var expected = create_row_from_string("0,0,_,_,1,1,1,_");
      var result = marker.mark_from_right(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should match fragments which stick to the the left bound", ()=>{
      var description = new Bounded_Array([3,1]);
      var row = create_row_from_string("_,o,o,_,_,_,x,o");
      var expected = create_row_from_string("0,x,_,_,_,1,1,_");
      var expected = create_row_from_string("_,0,0,_,_,_,x,1");
      var result = marker.mark_from_right(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should break a chain if some fragment doesn't sitck to or doesn't\
    contain a full cell", ()=>{
      var description = new Bounded_Array([2,2,1]);
      var row = create_row_from_string("_,o,o,_,_,_,x,o");
      var expected = create_row_from_string("_,o,o,_,_,_,x,2");
      var result = marker.mark_from_right(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should break a chain if a next full cell could belong to this fragment",
    ()=>{
      var description = new Bounded_Array([2,5]);
      var row = create_row_from_string("_,o,_,_,_,o,_,_");
      var expected = create_row_from_string("_,o,_,_,_,1,_,_");
      var result = marker.mark_from_right(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should not break a chain if a next full cell could belong to this\
    fragment, unless it was blocked first", ()=>{
      var description = new Bounded_Array([2,4]);
      var row = create_row_from_string("_,o,o,x,_,o,_,_");
      var expected = create_row_from_string("_,0,0,x,_,1,_,_");
      var result = marker.mark_from_right(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should return 'error' if any fragment don't fit in a row" , ()=>{
      var description = new Bounded_Array([2,1]);
      var row = create_row_from_string("_,x,o,_");
      var result = marker.mark_from_right(description, row);
      expect(result).toBe(Result.error);
    });
    it("should return 'error' if some fragment is bigger than description",
    ()=>{
      var description = new Bounded_Array([2,1]);
      var row = create_row_from_string("o,o,o,_,x,o,_");
      var result = marker.mark_from_right(description, row);
      expect(result).toBe(Result.error);
    });
  });
  describe("mark_by_size()", ()=>{
    var marker = new Row_Marker();
    it("should mark a fragment which can't be as big as second smallest", ()=>{
      var description = new Bounded_Array([4,3]);
      var row = create_row_from_string("_,_,_,_,x,_,o,_,x,_,_,_");
      var expected = create_row_from_string("_,_,_,_,x,_,1,_,x,_,_,_");
      var result = marker.mark_by_size(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should mark a fragment which is bigger than last but biggest", ()=>{
      var description = new Bounded_Array([4,2]);
      var row = create_row_from_string("_,_,_,_,_,o,o,o,_,_,_,_");
      var expected = create_row_from_string("_,_,_,_,_,0,0,0,_,_,_,_");
      var result = marker.mark_by_size(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should mark only a selected fragment", ()=>{
      var description = new Bounded_Array([2,1]);
      var row = create_row_from_string("o,o,_,_,_,o");
      var expected = create_row_from_string("0,0,_,_,_,o");
      var result = marker.mark_by_size(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should not mark a fragment if there is second description with the\
    same length", ()=>{
      var description = new Bounded_Array([4,4,2]);
      var row = create_row_from_string("_,_,_,_,_,o,o,o,_,_,_,_");
      var expected = create_row_from_string("_,_,_,_,_,o,o,o,_,_,_,_");
      var result = marker.mark_by_size(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should mark all fragments if there is only one description", ()=>{
      var description = new Bounded_Array([4]);
      var row = create_row_from_string("_,_,o,_,o,o,_,_");
      var expected = create_row_from_string("_,_,0,_,0,0,_,_");
      var result = marker.mark_by_size(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should mark any fragment that is bigger then a smaller one, and can't\
    be as big as the greater one", ()=>{
      var description = new Bounded_Array([4,3,1]);
      var row = create_row_from_string("_,_,_,_,x,_,o,o,x,_,_");
      var expected = create_row_from_string("_,_,_,_,x,_,1,1,x,_,_");
      var result = marker.mark_by_size(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should not mark a fragment that is not bigger then a smaller one,\
    or it can be as big as the greater one", ()=>{
      var description = new Bounded_Array([3,2]);
      var row = create_row_from_string("_,_,_,_,x,_,o,o,x,_,_");
      var expected = create_row_from_string("_,_,_,_,x,_,o,o,x,_,_");
      var result = marker.mark_by_size(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should take description bounds into consideration", ()=>{
      var description = new Bounded_Array([3,3,2,2]);
      description.left_bound = 1;
      description.right_bound = 2;
      var row = create_row_from_string("x,o,o,o,x,o,o");
      var expected = create_row_from_string("x,1,1,1,x,2,2");
      var result = marker.mark_by_size(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should take row bounds into consideration", ()=>{
      var description = new Bounded_Array([3,2]);
      var row = create_row_from_string("o,o,o,x,o,o,o,x,o,o,x,o,o");
      var expected = create_row_from_string("o,o,o,x,0,0,0,x,1,1,x,o,o");
      row.left_bound = 3;
      row.right_bound = 10;
      var result = marker.mark_by_size(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should return 'error' if fragment is bigger than any description", ()=>{
      var description = new Bounded_Array([3]);
      var row = create_row_from_string("_,o,o,o,o,_");
      var result = marker.mark_by_size(description, row);
      expect(result).toEqual(Result.error);
    });
    it("should return 'error' if fragment can't be as big as any description",
    ()=>{
      var description = new Bounded_Array([3]);
      var row = create_row_from_string("_,x,_,o,x,_");
      var result = marker.mark_by_size(description, row);
      expect(result).toEqual(Result.error);
    });
  });
  describe("mark_by_separation()", ()=>{
    var marker = new Row_Marker();
    it("should match three single cells if there are three descriptions", ()=>{
      var description = new Bounded_Array([1,1,1]);
      var row = create_row_from_string("_,_,o,_,_,_,o,_,_,_,o,_,_");
      var expected = create_row_from_string("_,_,0,_,_,_,1,_,_,_,2,_,_");
      var result = marker.mark_by_separation(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should match no cells if there are more descriptions than fragments",
    ()=>{
      var description = new Bounded_Array([1,1,1]);
      var row = create_row_from_string("_,_,o,_,_,_,o,_,_,_,x,_,_");
      var expected = create_row_from_string("_,_,o,_,_,_,o,_,_,_,x,_,_");
      var result = marker.mark_by_separation(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should match all cells in range of a single fragment", ()=>{
      var description = new Bounded_Array([5, 2]);
      var row = create_row_from_string("o,_,_,o,o,_,_,o,x");
      var expected = create_row_from_string("0,_,_,0,0,_,_,1,x");
      var result = marker.mark_by_separation(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should match cells separated by a block", ()=>{
      var description = new Bounded_Array([3,3]);
      var row = create_row_from_string("_,_,_,_,o,x,o,_,_,_,_");
      var expected = create_row_from_string("_,_,_,_,0,x,1,_,_,_,_");
      var result = marker.mark_by_separation(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should match no cells if a fragment is bigger than an underlying gap\
    (constrained by blocking cells)", ()=>{
      var description = new Bounded_Array([3,3]);
      var row = create_row_from_string("_,_,x,_,o,x,o,_,_,_,_");
      var expected = create_row_from_string("_,_,x,_,o,x,o,_,_,_,_");
      var result = marker.mark_by_separation(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should match no cells if a fragment is bigger than an underlying gap,\
    constrained by full cell from left and a block from right", ()=>{
      var description = new Bounded_Array([2,4]);
      var row = create_row_from_string("_,_,o,_,o,o,_,x");
      var expected = create_row_from_string("_,_,o,_,o,o,_,x");
      var result = marker.mark_by_separation(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should match no cells if a fragment is bigger than an underlying gap,\
    constrained by a block from left and a full cell from right", ()=>{
      var description = new Bounded_Array([2,4]);
      var row = create_row_from_string("_,o,x,o,o,o,_,o");
      var expected = create_row_from_string("_,o,x,o,o,o,_,o");
      var result = marker.mark_by_separation(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should match no cells if a fragment is bigger than an underlying gap,\
    constrained by a left bound", ()=>{
      var description = new Bounded_Array([4,4]);
      var row = create_row_from_string("_,o,o,x,o,o,o,o");
      var expected = create_row_from_string("_,o,o,x,o,o,o,o");
      var result = marker.mark_by_separation(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should match no cells if a fragment is bigger than an underlying gap,\
    constrained by a right bound", ()=>{
      var description = new Bounded_Array([4,4]);
      var row = create_row_from_string("_,o,o,o,x,o,o,o");
      var expected = create_row_from_string("_,o,o,o,x,o,o,o");
      var result = marker.mark_by_separation(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
  });
});

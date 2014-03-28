///<reference path="jasmine.d.ts"/>
///<reference path="../src/marked_resolver.ts"/>

describe("marked resolver", ()=>{
  describe("solve()", ()=>{
    var resolver = new Marked_Resolver();
    function set_resolvers_to_return(connector:Result, edge_blocker:Result,
    consecutive_blocker:Result, expander:Result){
        spyOn(resolver.connector, "connect_cells_with_same_id").and.
          returnValue(connector);
        spyOn(resolver.blocker, "block_edges").and.
          returnValue(edge_blocker);
        spyOn(resolver.blocker, "block_between_consecutive").and.
          returnValue(consecutive_blocker);
        spyOn(resolver.expander, "expand_marked_fragments").and.
          returnValue(expander);
    }
    function set_all_resolvers_to_return(result:Result){
      set_resolvers_to_return(result, result, result, result);
    }
    function set_all_but_one_to_return(all_result:Result, one_result:Result,
      one_name:string):void{
      switch(one_name){
        case "connector": set_resolvers_to_return(one_result, all_result,
                              all_result, all_result); break;
        case "edge_blocker": set_resolvers_to_return(all_result, one_result,
                              all_result, all_result); break;
        case "consecutive_blocker": set_resolvers_to_return(all_result, 
                              all_result, one_result, all_result); break;
        case "expander": set_resolvers_to_return(all_result, all_result,
                              all_result, one_result); break;
        default: throw "marked_resolver_spec.ts, set_all_but_one_to_return,\
                 invalid one_name";
      }
    }
    it("should return 'unchanged' when all resolvers return 'unchanged'", ()=>{
      set_all_resolvers_to_return(Result.unchanged);
      var result = resolver.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.unchanged);
    });
    it("should return 'changed' when connector returns 'changed'", ()=>{
      set_all_but_one_to_return(Result.unchanged, Result.changed, "connector");
      var result = resolver.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.changed);
    });
    it("should return 'changed' when edge_blocker returns 'changed'", ()=>{
      set_all_but_one_to_return(Result.unchanged, Result.changed,
        "edge_blocker");
      var result = resolver.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.changed);
    });
    it("should return 'changed' when consecutive_blocker returns 'changed'",
    ()=>{
      set_all_but_one_to_return(Result.unchanged, Result.changed,
        "consecutive_blocker");
      var result = resolver.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.changed);
    });
    it("should return 'changed' when expander returns 'changed'", ()=>{
      set_all_but_one_to_return(Result.unchanged, Result.changed, "expander");
      var result = resolver.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.changed);
    });
    it("should return 'error' when connector returns 'error'", ()=>{
      set_all_but_one_to_return(Result.changed, Result.error, "connector");
      var result = resolver.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.error);
    });
    it("should return 'error' when edge_blocker returns 'error'", ()=>{
      set_all_but_one_to_return(Result.changed, Result.error,
        "edge_blocker");
      var result = resolver.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.error);
    });
    it("should return 'error' when consecutive_blocker returns 'error'", ()=>{
      set_all_but_one_to_return(Result.changed, Result.error,
        "consecutive_blocker");
      var result = resolver.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.error);
    });
    it("should return 'error' when expander returns 'error'", ()=>{
      set_all_but_one_to_return(Result.changed, Result.error, "expander");
      var result = resolver.solve(new Bounded_Array(), new Bounded_Array());
      expect(result).toBe(Result.error);
    });
  });
  describe("connect_cells_with_same_id()", ()=>{
    var connector = new Marked_Resolver();
    it("should not connect cells with different id", ()=>{
      var description = new Bounded_Array();
      var row = create_row_from_string("0,_,1,_,2,_");
      var expected = create_row_from_string("0,_,1,_,2,_");
      var result = connector.connect_cells_with_same_id(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should connect cells with the same id", ()=>{
      var description = new Bounded_Array();
      var row = create_row_from_string("0,_,0,_,1,_,_,1,_,1");
      var expected = create_row_from_string("0,0,0,_,1,1,1,1,1,1");
      var result = connector.connect_cells_with_same_id(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should return 'error' if there is a blocked cell bettween connectable\
    cells", ()=>{
      var description = new Bounded_Array();
      var row = create_row_from_string("0,x,0");
      var result = connector.connect_cells_with_same_id(description, row);
      expect(result).toBe(Result.error);
    });
  });
  describe("block_edges()", ()=>{
    var blocker = new Marked_Resolver();
    it("should not block fragments if they are shorter than description", ()=>{
      var description = new Bounded_Array([2,3]);
      var row = create_row_from_string("_,0,_,_,1,1,_");
      var expected = create_row_from_string("_,0,_,_,1,1,_");
      var result = blocker.block_edges(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should block fragments if their length equals the description", ()=>{
      var description = new Bounded_Array([2,3]);
      var row = create_row_from_string("_,0,0,_,_,1,1,1,_");
      var expected = create_row_from_string("x,0,0,x,x,1,1,1,x");
      var result = blocker.block_edges(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should return 'error' if some fragment is bigger then the description,",
    ()=>{
      var description = new Bounded_Array([2,1]);
      var row = create_row_from_string("_,0,_,_,1,1,_");
      var result = blocker.block_edges(description, row);
      expect(result).toBe(Result.error);
    });
  });
  describe("block_between_consecutive()", ()=>{
    var blocker = new Marked_Resolver();
    it("should not block gaps between faraway fragments", ()=>{
      var description = new Bounded_Array([2,2]);
      var row = create_row_from_string("0,0,_,_,2,2");
      var expected = create_row_from_string("0,0,_,_,2,2");
      var result = blocker.block_between_consecutive(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should block gaps between consecutive fragments", ()=>{
      var description = new Bounded_Array([2,2]);
      var row = create_row_from_string("0,0,_,_,1,1");
      var expected = create_row_from_string("0,0,x,x,1,1");
      var result = blocker.block_between_consecutive(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should block a gap between the left bound and a first fragment", ()=>{
      var description = new Bounded_Array([2,2]);
      var row = create_row_from_string("_,_,0,0");
      var expected = create_row_from_string("x,x,0,0");
      var result = blocker.block_between_consecutive(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should not block a gap between the left bound and a faraway fragment",
    ()=>{
      var description = new Bounded_Array([2,2]);
      var row = create_row_from_string("_,_,1,1");
      var expected = create_row_from_string("_,_,1,1");
      var result = blocker.block_between_consecutive(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should block a gap between the left bound and a faraway fragment if\
    description bounds have been adjusted",
    ()=>{
      var description = new Bounded_Array([2,2]);
      description.left_bound = 1;
      var row = create_row_from_string("_,_,1,1");
      var expected = create_row_from_string("x,x,1,1");
      var result = blocker.block_between_consecutive(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should block a gap between the right bound and a last fragment", ()=>{
      var description = new Bounded_Array([2,2]);
      var row = create_row_from_string("1,1,_,_");
      var expected = create_row_from_string("1,1,x,x");
      var result = blocker.block_between_consecutive(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should not block a gap between the right bound and a faraway fragment",
    ()=>{
      var description = new Bounded_Array([2,2]);
      var row = create_row_from_string("0,0,_,_");
      var expected = create_row_from_string("0,0,_,_");
      var result = blocker.block_between_consecutive(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should block a gap between the right bound and a faraway fragment if\
    description bounds have been adjusted",
    ()=>{
      var description = new Bounded_Array([2,2]);
      description.right_bound = 0;
      var row = create_row_from_string("0,0,_,_");
      var expected = create_row_from_string("0,0,x,x");
      var result = blocker.block_between_consecutive(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should leave some space for potential extensions", ()=>{
      var description = new Bounded_Array([3,3]);
      var row = create_row_from_string("_,_,_,0,_,_,_,_,_,1,_,_,_");
      var expected = create_row_from_string("x,_,_,0,_,_,x,_,_,1,_,_,x");
      var result = blocker.block_between_consecutive(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should consider blocks while leaving space for potential extensions",
    ()=>{
      var description = new Bounded_Array([3,3]);
      var row = create_row_from_string("_,_,x,0,x,_,_,_,x,1,x,_,_");
      var expected = create_row_from_string("x,x,x,0,x,x,x,x,x,1,x,x,x");
      var result = blocker.block_between_consecutive(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
  });
  describe("expand_marked_fragments()", ()=>{
    var expander = new Marked_Resolver();
    it("should do nothing if all fragments has their target length", ()=>{
      var description = new Bounded_Array([2,3]);
      var row = create_row_from_string("_,0,0,_,1,1,1,_");
      var expected = create_row_from_string("_,0,0,_,1,1,1,_");
      var result = expander.expand_marked_fragments(description, row);
      expect(result).toBe(Result.unchanged);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should expand fragment's right bound, if its left bound is attached\
    to the row's left bound", ()=>{
      var description = new Bounded_Array([3]);
      var row = create_row_from_string("0,_,_,_");
      var expected = create_row_from_string("0,0,0,_");
      var result = expander.expand_marked_fragments(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should expand fragment's right bound, if its left bound is attached\
    to the translated row's left bound", ()=>{
      var description = new Bounded_Array([3]);
      var row = create_row_from_string("_,0,_,_,_");
      row.left_bound = 1;
      var expected = create_row_from_string("_,0,0,0,_");
      var result = expander.expand_marked_fragments(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should expand fragment's right bound, if its left bound is constained\
    by the row's left bound", ()=>{
      var description = new Bounded_Array([3]);
      var row = create_row_from_string("_,0,_,_");
      var expected = create_row_from_string("_,0,0,_");
      var result = expander.expand_marked_fragments(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should expand fragment's right bound, if its left bound is attached\
    to a blocked cell", ()=>{
      var description = new Bounded_Array([3]);
      var row = create_row_from_string("x,0,_,_,_");
      var expected = create_row_from_string("x,0,0,0,_");
      var result = expander.expand_marked_fragments(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should expand fragment's right bound, if its left bound is constrained\
    by a blocked cell", ()=>{
      var description = new Bounded_Array([3]);
      var row = create_row_from_string("x,_,0,_,_");
      var expected = create_row_from_string("x,_,0,0,_");
      var result = expander.expand_marked_fragments(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should expand fragment's left bound, if its right bound is attached\
    to the row's right bound", ()=>{
      var description = new Bounded_Array([3]);
      var row = create_row_from_string("_,_,_,0");
      var expected = create_row_from_string("_,0,0,0");
      var result = expander.expand_marked_fragments(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should expand fragment's left bound, if its right bound is constrained\
    by the row's right bound", ()=>{
      var description = new Bounded_Array([3]);
      var row = create_row_from_string("_,_,0,_");
      var expected = create_row_from_string("_,0,0,_");
      var result = expander.expand_marked_fragments(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should expand fragment's left bound, if its right bound is attached\
    to the translated row's right bound", ()=>{
      var description = new Bounded_Array([3]);
      var row = create_row_from_string("_,_,_,0,_");
      row.right_bound = 3;
      var expected = create_row_from_string("_,0,0,0,_");
      var result = expander.expand_marked_fragments(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should expand fragment's left bound, if its right bound is attached\
    to a blocked cell", ()=>{
      var description = new Bounded_Array([3]);
      var row = create_row_from_string("_,_,_,0,x");
      var expected = create_row_from_string("_,0,0,0,x");
      var result = expander.expand_marked_fragments(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    it("should expand fragment's left bound, if its right bound is constrained\
    by a blocked cell", ()=>{
      var description = new Bounded_Array([3]);
      var row = create_row_from_string("_,_,0,_,x");
      var expected = create_row_from_string("_,0,0,_,x");
      var result = expander.expand_marked_fragments(description, row);
      expect(result).toBe(Result.changed);
      expect(row.array_equals(expected.array)).toBe(true);
    });
    describe("should return 'error' if an extended fragment can't be as big as\
    an underlying description", ()=>{
      it("constrained with a row's bound from right", ()=>{
        var description = new Bounded_Array([3]);
        var row = create_row_from_string("0,_");
        var result = expander.expand_marked_fragments(description, row);
        expect(result).toBe(Result.error);
      });
      it("constrained with a blocked cell from right", ()=>{
        var description = new Bounded_Array([3]);
        var row = create_row_from_string("0,_,x");
        var result = expander.expand_marked_fragments(description, row);
        expect(result).toBe(Result.error);
      });
      it("constrained with a row's bound from left", ()=>{
        var description = new Bounded_Array([3]);
        var row = create_row_from_string("_,0");
        var result = expander.expand_marked_fragments(description, row);
        expect(result).toBe(Result.error);
      });
      it("constrained with a blocked cell from left", ()=>{
        var description = new Bounded_Array([3]);
        var row = create_row_from_string("x,_,0");
        var result = expander.expand_marked_fragments(description, row);
        expect(result).toBe(Result.error);
      });
    });
  });
});

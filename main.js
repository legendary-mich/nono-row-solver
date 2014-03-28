///<reference path="bounded_array.ts"/>
var Fragment = (function () {
    function Fragment(left_bound, right_bound, value, row) {
        this.left_bound = left_bound;
        this.right_bound = right_bound;
        this.value = value;
        this.row = row;
    }
    Fragment.prototype.clone = function () {
        return new Fragment(this.left_bound, this.right_bound, this.value, this.row);
    };

    Fragment.prototype.length = function () {
        return this.right_bound - this.left_bound + 1;
    };
    Fragment.prototype.is_valid = function () {
        return this.length() > 0;
    };

    Fragment.from_left_and_right_bounds = function (left_bound, right_bound, value, row) {
        if (typeof row === "undefined") { row = null; }
        return new Fragment(left_bound, right_bound, value, row);
    };
    Fragment.from_left_bound_and_length = function (left_bound, length, value, row) {
        if (typeof row === "undefined") { row = null; }
        return new Fragment(left_bound, left_bound + length - 1, value, row);
    };
    Fragment.from_right_bound_and_length = function (right_bound, length, value, row) {
        if (typeof row === "undefined") { row = null; }
        return new Fragment(right_bound - length + 1, right_bound, value, row);
    };

    Fragment.prototype.move = function (vector) {
        this.left_bound += vector;
        this.right_bound += vector;
    };
    Fragment.prototype.move_left_bound_to = function (index) {
        var vector = index - this.left_bound;
        this.move(vector);
    };
    Fragment.prototype.move_right_bound_to = function (index) {
        var vector = index - this.right_bound;
        this.move(vector);
    };
    Fragment.prototype.move_left_until = function (left_bound_predicate, right_bound_predicate) {
        var first_left = this.row.last_index(left_bound_predicate, this.left_bound - 1);
        if (first_left == -1)
            first_left = this.row.left_bound - 1;
        ++first_left;

        var first_right = this.row.last_index(right_bound_predicate, this.right_bound);
        if (first_right == -1)
            this.move_left_bound_to(first_left);
        else {
            this.move_right_bound_to(first_right);
            if (this.left_bound < first_left)
                this.move_left_bound_to(first_left);
        }
        return this;
    };
    Fragment.prototype.set_length_extending_left_bound = function (value) {
        this.left_bound = this.right_bound - value + 1;
    };
    Fragment.prototype.set_length_extending_right_bound = function (value) {
        this.right_bound = this.left_bound + value - 1;
    };
    Fragment.prototype.compute_left_bound = function (new_right_bound) {
        return new_right_bound - this.length() + 1;
    };
    Fragment.prototype.compute_right_bound = function (new_left_bound) {
        return new_left_bound + this.length() - 1;
    };
    Fragment.prototype.extend_left_side_while = function (predicate) {
        var first_not = this.row.last_index_not(predicate, this.left_bound);
        if (first_not == -1)
            this.left_bound = this.row.left_bound;
        else if (first_not != this.left_bound)
            this.left_bound = first_not + 1;
        return this;
    };
    Fragment.prototype.extend_left_side_until = function (predicate, max_length) {
        if (typeof max_length === "undefined") { max_length = Number.MAX_VALUE; }
        var first = this.row.last_index(predicate, this.left_bound - 1);
        this.set_length_extending_left_bound(max_length);
        if (first == -1)
            first = this.row.left_bound - 1;
        this.left_bound = Math.max(first + 1, this.left_bound);
        return this;
    };
    Fragment.prototype.extend_right_side_until = function (predicate, max_length) {
        if (typeof max_length === "undefined") { max_length = Number.MAX_VALUE; }
        var first = this.row.first_index(predicate, this.right_bound + 1);
        this.set_length_extending_right_bound(max_length);
        if (first == -1)
            first = this.row.right_bound + 1;
        this.right_bound = Math.min(first - 1, this.right_bound);
        return this;
    };
    Fragment.prototype.extend_until = function (predicate) {
        this.extend_left_side_until(predicate, Number.MAX_VALUE);
        this.extend_right_side_until(predicate, Number.MAX_VALUE);
        return this;
    };
    Fragment.prototype.extend_right_side_while = function (predicate) {
        var first_not = this.row.first_index_not(predicate, this.right_bound);
        if (first_not == -1)
            this.right_bound = this.row.right_bound;
        else if (first_not != this.right_bound)
            this.right_bound = first_not - 1;
        return this;
    };
    Fragment.prototype.extend_while = function (predicate) {
        this.extend_left_side_while(predicate);
        this.extend_right_side_while(predicate);
        return this;
    };
    Fragment.prototype.reduce_left_side_until = function (predicate) {
        var first = this.row.first_index(predicate, this.left_bound);
        if (first == -1)
            this.left_bound = this.right_bound + 1;
        else
            this.left_bound = first;
        return this;
    };
    Fragment.prototype.reduce_right_side_until = function (predicate) {
        var first = this.row.last_index(predicate, this.right_bound);
        if (first == -1)
            this.right_bound = this.left_bound - 1;
        else
            this.right_bound = first;
        return this;
    };
    Fragment.prototype.reduce_until = function (predicate) {
        this.reduce_left_side_until(predicate);
        this.reduce_right_side_until(predicate);
        return this;
    };
    Fragment.prototype.fill = function (predicate) {
        if (typeof predicate === "undefined") { predicate = null; }
        var lower = Math.max(this.left_bound, this.row.left_bound);
        var upper = Math.min(this.right_bound, this.row.right_bound);
        if (predicate == null)
            for (var i = lower; i <= upper; ++i)
                this.row.array[i] = this.value;
        else
            for (var i = lower; i <= upper; ++i)
                if (predicate(this.row.array[i]))
                    this.row.array[i] = this.value;
    };
    Fragment.prototype.some = function (predicate) {
        var lower = Math.max(this.left_bound, this.row.left_bound);
        var upper = Math.min(this.right_bound, this.row.right_bound);
        for (var i = lower; i <= upper; ++i)
            if (predicate(this.row.array[i]))
                return true;
        return false;
    };
    Fragment.prototype.inside_bounds = function () {
        return this.left_bound >= this.row.left_bound && this.right_bound <= this.row.right_bound;
    };
    Fragment.prototype.contains = function (index) {
        return index >= this.left_bound && index <= this.right_bound;
    };
    Fragment.prototype.contains_fragment = function (other) {
        return this.contains(other.left_bound) && this.contains(other.right_bound);
    };
    Fragment.prototype.intersects = function (other) {
        return this.left_bound <= other.right_bound && this.right_bound >= other.left_bound;
    };
    Fragment.prototype.product = function (other) {
        if (!this.intersects(other))
            return null;
        return Fragment.from_left_and_right_bounds(Math.max(this.left_bound, other.left_bound), Math.min(this.right_bound, other.right_bound), this.value);
    };
    Fragment.prototype.found_place_moving_right = function (predicate) {
        if (this.right_bound > this.row.right_bound)
            return false;
        this.move_left_bound_to(Math.max(this.left_bound, this.row.left_bound));
        var last_not;
        while (true) {
            if (this.right_bound > this.row.right_bound)
                return false;
            last_not = this.row.last_index_not(predicate, this.right_bound);
            if (last_not == -1)
                return true;
            if (last_not < this.left_bound)
                return true;
            this.move_left_bound_to(last_not + 1);
        }
    };
    Fragment.prototype.found_place_moving_left = function (predicate) {
        if (this.left_bound < this.row.left_bound)
            return false;
        this.move_right_bound_to(Math.min(this.right_bound, this.row.right_bound));
        var last_not;
        while (true) {
            if (this.left_bound < this.row.left_bound)
                return false;
            last_not = this.row.first_index_not(predicate, this.left_bound);
            if (last_not == -1)
                return true;
            if (last_not > this.right_bound)
                return true;
            this.move_right_bound_to(last_not - 1);
        }
    };
    Fragment.prototype.extract_fully_contained_fragments = function (predicate) {
        var fragments = this.row.extract_fragments(predicate, this.left_bound, this.right_bound);
        if (fragments.length > 0 && fragments[0].left_bound < this.left_bound)
            fragments.shift();
        if (fragments.length > 0 && fragments[fragments.length - 1].right_bound > this.right_bound)
            fragments.pop();
        return fragments;
    };
    return Fragment;
})();
///<reference path="fragment.ts"/>
var Bounded_Array = (function () {
    function Bounded_Array(array) {
        if (typeof array === "undefined") { array = []; }
        this.array = array;
        this.reset_bounds();
    }
    Bounded_Array.prototype.length = function () {
        return this.right_bound - this.left_bound + 1;
    };
    Bounded_Array.prototype.is_empty = function () {
        return this.length() < 1;
    };

    Bounded_Array.prototype.set_bounds = function (lower, upper) {
        this.left_bound = lower;
        this.right_bound = upper;
    };
    Bounded_Array.prototype.reset_bounds = function () {
        this.left_bound = 0;
        this.right_bound = this.array.length - 1;
    };
    Bounded_Array.prototype.get = function (index) {
        return this.array[index];
    };
    Bounded_Array.prototype.get_or_default = function (index, default_value) {
        if (index < this.left_bound || index > this.right_bound)
            return default_value;
        return this.array[index];
    };
    Bounded_Array.prototype.get_all_that = function (predicate) {
        var result = [];
        for (var i = this.left_bound; i <= this.right_bound; ++i)
            if (predicate(this.array[i]))
                result.push(this.array[i]);
        return result;
    };
    Bounded_Array.prototype.index_of = function (value) {
        for (var i = this.left_bound; i <= this.right_bound; ++i)
            if (this.array[i] == value)
                return i;
        return -1;
    };
    Bounded_Array.prototype.clone = function () {
        var res = new Bounded_Array(this.array.slice(0));
        res.left_bound = this.left_bound;
        res.right_bound = this.right_bound;
        return res;
    };
    Bounded_Array.prototype.array_equals = function (other_array) {
        if (this.array.length != other_array.length)
            return false;
        for (var i = 0; i < this.array.length; ++i)
            if (this.array[i] != other_array[i])
                return false;
        return true;
    };
    Bounded_Array.prototype.equals = function (other) {
        if (other == null)
            return false;
        if (other.left_bound != this.left_bound)
            return false;
        if (other.right_bound != this.right_bound)
            return false;
        for (var i = this.left_bound; i <= this.right_bound; ++i)
            if (this.array[i] != other.array[i])
                return false;
        return true;
    };
    Bounded_Array.prototype.embed = function (other, product) {
        var left_bound = Math.max(this.left_bound, other.left_bound);
        var right_bound = Math.min(this.right_bound, other.right_bound);
        for (var i = left_bound; i <= right_bound; ++i)
            this.array[i] = product(this.array[i], other.array[i]);
    };
    Bounded_Array.prototype.first_index = function (predicate, from) {
        if (typeof from === "undefined") { from = this.left_bound; }
        from = Math.max(from, this.left_bound);
        for (var i = from; i <= this.right_bound; ++i)
            if (predicate(this.array[i]))
                return i;
        return -1;
    };
    Bounded_Array.prototype.last_index = function (predicate, from) {
        if (typeof from === "undefined") { from = this.right_bound; }
        from = Math.min(from, this.right_bound);
        for (var i = from; i >= this.left_bound; --i)
            if (predicate(this.array[i]))
                return i;
        return -1;
    };
    Bounded_Array.prototype.first_index_not = function (predicate, from) {
        if (typeof from === "undefined") { from = this.left_bound; }
        from = Math.max(from, this.left_bound);
        var i = Math.min(from, this.right_bound + 1);
        for (; i <= this.right_bound; ++i)
            if (!predicate(this.array[i]))
                return i;
        return i;
    };
    Bounded_Array.prototype.last_index_not = function (predicate, from) {
        if (typeof from === "undefined") { from = this.right_bound; }
        from = Math.min(from, this.right_bound);
        var i = Math.max(from, this.left_bound - 1);
        for (; i >= this.left_bound; --i)
            if (!predicate(this.array[i]))
                return i;
        return i;
    };
    Bounded_Array.prototype.some = function (predicate) {
        for (var i = this.left_bound; i <= this.right_bound; ++i)
            if (predicate(this.array[i]))
                return true;
        return false;
    };
    Bounded_Array.prototype.every = function (predicate) {
        for (var i = this.left_bound; i <= this.right_bound; ++i)
            if (!predicate(this.array[i]))
                return false;
        return true;
    };
    Bounded_Array.prototype.replace_all_with = function (predicate, value) {
        for (var i = this.left_bound; i <= this.right_bound; ++i)
            if (predicate(this.array[i]))
                this.array[i] = value;
    };
    Bounded_Array.prototype.extract_fragments = function (predicate, left_bound, right_bound) {
        if (typeof left_bound === "undefined") { left_bound = this.left_bound; }
        if (typeof right_bound === "undefined") { right_bound = this.right_bound; }
        left_bound = Math.max(left_bound, this.left_bound);
        right_bound = Math.min(right_bound, this.right_bound);
        var result = [];
        var temp_frag;
        for (var i = left_bound; i <= right_bound; ++i)
            if (predicate(this.array[i])) {
                temp_frag = Fragment.from_left_bound_and_length(i, 1, this.array[i]);
                temp_frag.row = this;
                temp_frag.extend_while(predicate);
                result.push(temp_frag);
                i = temp_frag.right_bound;
            }
        return result;
    };

    //extract_distinct_fragments(predicate:(value:number)=>boolean):Fragment
    Bounded_Array.prototype.create_description_fragments = function (underlying_row) {
        var result = [];
        var temp_fragment;
        for (var i = this.left_bound; i <= this.right_bound; ++i) {
            temp_fragment = Fragment.from_left_bound_and_length(0, this.array[i], i);
            temp_fragment.row = underlying_row;
            result.push(temp_fragment);
        }
        return result;
    };
    Bounded_Array.prototype.smallest_value = function () {
        var min = Number.MAX_VALUE;
        for (var i = this.left_bound; i <= this.right_bound; ++i)
            if (this.array[i] < min)
                min = this.array[i];
        return min;
    };
    Bounded_Array.prototype.leftmost_value = function () {
        return this.array[this.left_bound];
    };
    Bounded_Array.prototype.rightmost_value = function () {
        return this.array[this.right_bound];
    };
    Bounded_Array.prototype.count = function (predicate) {
        var counter = 0;
        for (var i = this.left_bound; i <= this.right_bound; ++i)
            if (predicate(this.array[i]))
                ++counter;
        return counter;
    };
    return Bounded_Array;
})();
///<reference path="bounded_array.ts"/>
var Result;
(function (Result) {
    Result[Result["undefined"] = 0] = "undefined";
    Result[Result["changed"] = 1] = "changed";
    Result[Result["unchanged"] = 2] = "unchanged";
    Result[Result["error"] = 3] = "error";
    Result[Result["success"] = 4] = "success";
})(Result || (Result = {}));
var Cell_State;
(function (Cell_State) {
    Cell_State[Cell_State["undefined"] = -4] = "undefined";
    Cell_State[Cell_State["empty"] = -3] = "empty";
    Cell_State[Cell_State["blocked"] = -2] = "blocked";
    Cell_State[Cell_State["full"] = -1] = "full";
})(Cell_State || (Cell_State = {}));

var Tier = (function () {
    function Tier(description, row) {
        this.description = description;
        this.row = row;
    }
    return Tier;
})();
///<reference path="interfaces.ts"/>
function create_row_from_string(description) {
    var char_array = description.split(",");
    var row = [];
    for (var i = 0; i < char_array.length; ++i) {
        switch (char_array[i]) {
            case "_":
                row.push(-3 /* empty */);
                break;
            case "x":
                row.push(-2 /* blocked */);
                break;
            case "o":
                row.push(-1 /* full */);
                break;
            default:
                row.push(parseInt(char_array[i]));
        }
    }
    return new Bounded_Array(row);
}
function true_is_true(value) {
    return true;
}
function false_is_true(value) {
    return false;
}
function is_empty(value) {
    return value == -3 /* empty */;
}
function is_full(value) {
    return value == -1 /* full */;
}
function is_blocked(value) {
    return value == -2 /* blocked */;
}
function is_not_blocked(value) {
    return value != -2 /* blocked */;
}
function is_marked(value) {
    return value >= 0;
}
function is_full_or_marked(value) {
    return value == -1 /* full */ || value >= 0;
}
function is_full_or_blocked(value) {
    return value == -1 /* full */ || value == -2 /* blocked */;
}
function is_full_or_empty(value) {
    return value == -1 /* full */ || value == -3 /* empty */;
}
function is_blocked_or_marked(value) {
    return value == -2 /* blocked */ || value >= 0;
}
function is_full_marked_or_empty(value) {
    return value == -3 /* empty */ || value == -1 /* full */ || value >= 0;
}
function is_full_marked_or_blocked(value) {
    return value >= 0 || value == -1 /* full */ || value == -2 /* blocked */;
}
function inside_bounds(lower, higher) {
    return function (value) {
        return lower <= value && value <= higher;
    };
}

//products
function full_over_empty_or_a(a, b) {
    if (a == -3 /* empty */ && b == -1 /* full */)
        return b;
    return a;
}
function full_or_b(a, b) {
    if (a == -1 /* full */)
        return a;
    return b;
}
function same_ids_yield_full_cell(a, b) {
    if (a >= 0 && b == a)
        return -1 /* full */;
    return -4 /* undefined */;
}
function marked_or_a(a, b) {
    if (b >= 0)
        return b;
    return a;
}

//array
function merge(a, b, product) {
    var result = [];
    for (var i = 0; i < a.length; ++i)
        result.push(product(a[i], b[i]));
    return result;
}

//cell state
function cell_state_toString(state) {
    if (state >= 0)
        return "marked";
    switch (state) {
        case -4 /* undefined */:
            return "undefined";
        case -3 /* empty */:
            return "empty";
        case -2 /* blocked */:
            return "blocked";
        case -1 /* full */:
            return "full";
        default:
            return "undefined";
    }
}
function cell_state_fromString(state) {
    switch (state) {
        case "undefined":
            return -4 /* undefined */;
        case "empty":
            return -3 /* empty */;
        case "blocked":
            return -2 /* blocked */;
        case "full":
            return -1 /* full */;
        default:
            throw "invalid state: " + state;
    }
}

//result
function result_toString(result) {
    switch (result) {
        case 0 /* undefined */:
            return "undefined";
        case 1 /* changed */:
            return "changed";
        case 2 /* unchanged */:
            return "unchanged";
        case 3 /* error */:
            return "error";

        default:
            return "undefined";
    }
}
///<reference path="helpers.ts"/>
var Row_Blocker = (function () {
    function Row_Blocker() {
    }
    Row_Blocker.prototype.solve = function (description, row) {
        var result = 2 /* unchanged */;
        var smallest_description = description.smallest_value();
        var gaps = row.extract_fragments(is_not_blocked);
        for (var i = 0; i < gaps.length; ++i)
            if (gaps[i].length() < smallest_description) {
                if (gaps[i].some(is_full_or_marked))
                    return 3 /* error */;
                gaps[i].value = -2 /* blocked */;
                gaps[i].fill();
                result = 1 /* changed */;
            }

        return result;
    };
    return Row_Blocker;
})();
///<reference path="helpers.ts"/>
var Row_Marker = (function () {
    function Row_Marker() {
        this.left_marker = this;
        this.right_marker = this;
        this.size_marker = this;
        this.separation_marker = this;
    }
    //I_Row_Solver
    Row_Marker.prototype.solve = function (description, row) {
        var result = 2 /* unchanged */;
        var temp_result;
        var left_row = row.clone();
        var right_row = row.clone();
        var size_row = row.clone();
        var separation_row = row.clone();

        temp_result = this.left_marker.mark_from_left(description, left_row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;
        if (temp_result == 1 /* changed */)
            result = 1 /* changed */;

        temp_result = this.right_marker.mark_from_right(description, right_row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;
        if (temp_result == 1 /* changed */)
            result = 1 /* changed */;

        temp_result = this.size_marker.mark_by_size(description, size_row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;
        if (temp_result == 1 /* changed */)
            result = 1 /* changed */;

        temp_result = this.separation_marker.mark_by_separation(description, separation_row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;
        if (temp_result == 1 /* changed */)
            result = 1 /* changed */;

        row.embed(left_row, marked_or_a);
        row.embed(right_row, marked_or_a);
        row.embed(size_row, marked_or_a);
        row.embed(separation_row, marked_or_a);

        return result;
    };

    //I_Row_Marker
    Row_Marker.prototype.mark_from_left = function (description, row) {
        var result = 2 /* unchanged */;
        var fragments = description.create_description_fragments(row);
        fragments.unshift(Fragment.from_left_bound_and_length(row.left_bound - 2, 1, description.left_bound - 1));
        var current_size;
        var xor;

        for (var i = 1; i < fragments.length; ++i) {
            fragments[i].move_left_bound_to(fragments[i - 1].right_bound + 2);
            if (fragments[i].found_place_moving_right(is_not_blocked)) {
                current_size = fragments[i].length();
                ++fragments[i].right_bound; //checks if it is adjacent to a full cell
                if (!fragments[i].some(is_full))
                    break;
                fragments[i].reduce_until(is_full).extend_while(is_full);
                if (fragments[i].length() > current_size)
                    return 3 /* error */;
                fragments[i].fill(is_full);
                result = 1 /* changed */;
                xor = fragments[i].clone();
                xor.extend_right_side_until(is_blocked, current_size);
                xor.left_bound = fragments[i].right_bound + 1;
                if (xor.some(is_full))
                    break;
            } else
                return 3 /* error */;
        }
        return result;
    };
    Row_Marker.prototype.mark_from_right = function (description, row) {
        var result = 2 /* unchanged */;
        var fragments = description.create_description_fragments(row);
        fragments.push(Fragment.from_left_bound_and_length(row.right_bound + 2, 1, description.right_bound + 1));
        var current_size;
        var xor;

        for (var i = fragments.length - 2; i >= 0; --i) {
            fragments[i].move_right_bound_to(fragments[i + 1].left_bound - 2);
            if (fragments[i].found_place_moving_left(is_not_blocked)) {
                current_size = fragments[i].length();
                --fragments[i].left_bound; //checks if it is adjacent to a full cell
                if (!fragments[i].some(is_full))
                    break;
                fragments[i].reduce_until(is_full).extend_while(is_full);
                if (fragments[i].length() > current_size)
                    return 3 /* error */;
                fragments[i].fill(is_full);
                result = 1 /* changed */;
                xor = fragments[i].clone();
                xor.extend_left_side_until(is_blocked, current_size);
                xor.right_bound = fragments[i].left_bound - 1;
                if (xor.some(is_full))
                    break;
            } else
                return 3 /* error */;
        }
        return result;
    };
    Row_Marker.prototype.mark_by_size = function (description, row) {
        var result = 2 /* unchanged */;
        var fragments = row.extract_fragments(is_full);
        var available_space;
        var matching_descriptions;
        for (var i = 0; i < fragments.length; ++i) {
            available_space = fragments[i].clone();
            available_space.extend_until(is_blocked);
            matching_descriptions = description.get_all_that(inside_bounds(fragments[i].length(), available_space.length()));
            if (matching_descriptions.length == 0)
                return 3 /* error */;
            if (matching_descriptions.length != 1)
                continue;
            fragments[i].value = description.index_of(matching_descriptions[0]);
            fragments[i].fill(); //(is_full);
            result = 1 /* changed */;
        }
        return result;
    };
    Row_Marker.prototype.mark_by_separation = function (description, row) {
        var fragments = description.create_description_fragments(row);
        var from = row.left_bound;
        var index;
        for (var i = 0; i < fragments.length; ++i) {
            index = row.first_index(is_full, from);
            if (index == -1)
                return 2 /* unchanged */;
            fragments[i].move_left_bound_to(index);

            index = row.first_index_not(is_full_or_empty, fragments[i].left_bound);
            if (index <= fragments[i].right_bound)
                fragments[i].move_right_bound_to(index - 1);

            if (row.get(fragments[i].right_bound + 1) == -1 /* full */) {
                index = row.last_index_not(is_full, fragments[i].right_bound);
                fragments[i].move_right_bound_to(index - 1);
            }

            if (fragments[i].left_bound < from)
                return 2 /* unchanged */;
            if (fragments[i].some(is_blocked))
                return 2 /* unchanged */;

            from = fragments[i].right_bound + 2;
        }
        if (i == fragments.length) {
            for (i = 0; i < fragments.length; ++i)
                fragments[i].fill(is_full);
            return 1 /* changed */;
        }
        return 2 /* unchanged */;
    };
    return Row_Marker;
})();
///<reference path="helpers.ts"/>
var Marked_Resolver = (function () {
    function Marked_Resolver() {
        this.connector = this;
        this.blocker = this;
        this.expander = this;
    }
    Marked_Resolver.prototype.solve = function (description, row) {
        var result = 2 /* unchanged */;
        var temp_result;

        temp_result = this.connector.connect_cells_with_same_id(description, row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;
        if (temp_result == 1 /* changed */)
            result = 1 /* changed */;

        temp_result = this.blocker.block_edges(description, row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;
        if (temp_result == 1 /* changed */)
            result = 1 /* changed */;

        temp_result = this.blocker.block_between_consecutive(description, row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;
        if (temp_result == 1 /* changed */)
            result = 1 /* changed */;

        temp_result = this.expander.expand_marked_fragments(description, row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;
        if (temp_result == 1 /* changed */)
            result = 1 /* changed */;

        return result;
    };

    Marked_Resolver.prototype.connect_cells_with_same_id = function (description, row) {
        var result = 2 /* unchanged */;
        var fragments = row.extract_fragments(is_marked);
        var temp_frag;
        for (var i = 1; i < fragments.length; ++i) {
            if (fragments[i].value == fragments[i - 1].value) {
                temp_frag = Fragment.from_left_and_right_bounds(fragments[i - 1].right_bound + 1, fragments[i].left_bound - 1, fragments[i].value, row);
                if (temp_frag.some(is_blocked))
                    return 3 /* error */;
                temp_frag.fill();
                result = 1 /* changed */;
            }
        }
        return result;
    };

    Marked_Resolver.prototype.block_edges = function (description, row) {
        var result = 2 /* unchanged */;
        var fragments = row.extract_fragments(is_marked);
        var filler = Fragment.from_left_bound_and_length(0, 1, -2 /* blocked */, row);
        for (var i = 0; i < fragments.length; ++i) {
            if (fragments[i].length() > description.get(fragments[i].value))
                return 3 /* error */;
            if (fragments[i].length() == description.get(fragments[i].value)) {
                filler.move_left_bound_to(fragments[i].left_bound - 1);
                filler.fill();
                filler.move_left_bound_to(fragments[i].right_bound + 1);
                filler.fill();
                result = 1 /* changed */;
            }
        }
        return result;
    };

    Marked_Resolver.prototype.block_between_consecutive = function (description, row) {
        var result = 2 /* unchanged */;
        var fragments = row.extract_fragments(is_marked);
        if (fragments.length == 0)
            return result;

        if (fragments[0].left_bound > row.left_bound)
            fragments.unshift(Fragment.from_left_bound_and_length(row.left_bound - 1, 1, description.left_bound - 1, row));
        if (fragments[fragments.length - 1].right_bound < row.right_bound)
            fragments.push(Fragment.from_left_bound_and_length(row.right_bound + 1, 1, description.right_bound + 1, row));

        var filler;
        var max_left, max_right;
        for (var i = 1; i < fragments.length; ++i)
            if (fragments[i].value - fragments[i - 1].value == 1) {
                max_left = fragments[i - 1].clone().extend_right_side_until(is_blocked, description.get_or_default(fragments[i - 1].value, 1));
                max_right = fragments[i].clone().extend_left_side_until(is_blocked, description.get_or_default(fragments[i].value, 1));
                filler = Fragment.from_left_and_right_bounds(max_left.right_bound + 1, max_right.left_bound - 1, -2 /* blocked */, row);
                filler.fill();
                result = 1 /* changed */;
            }
        return result;
    };

    Marked_Resolver.prototype.expand_marked_fragments = function (description, row) {
        var result = 2 /* unchanged */;
        var fragments = row.extract_fragments(is_marked);
        var left_band, right_band;
        var target_length;
        for (var i = 0; i < fragments.length; ++i) {
            target_length = description.get(fragments[i].value);
            fragments[i].extend_left_side_until(is_blocked);
            if (fragments[i].length() < target_length) {
                fragments[i].extend_right_side_until(is_blocked, target_length);
                if (fragments[i].length() < target_length)
                    return 3 /* error */;
                fragments[i].reduce_left_side_until(is_marked);
                fragments[i].fill();
                result = 1 /* changed */;
            } else
                fragments[i].reduce_left_side_until(is_marked);
            fragments[i].extend_right_side_until(is_blocked, target_length);
            if (fragments[i].length() < target_length) {
                fragments[i].extend_left_side_until(is_blocked, target_length);
                fragments[i].reduce_right_side_until(is_marked);
                fragments[i].fill();
                result = 1 /* changed */;
            }
        }
        return result;
    };
    return Marked_Resolver;
})();
///<reference path="helpers.ts"/>
///<reference path="row_solver.ts"/>
var Row_Splitter = (function () {
    function Row_Splitter() {
        this.splitter = this;
        this.solver = new Row_Solver(new Dummy_Splitter());
    }
    Row_Splitter.prototype.solve = function (description, row) {
        var result = 2 /* unchanged */;
        var temp_result;
        var not_marked = this.splitter.extract_not_marked_parts(description, row);
        for (var i = 0; i < not_marked.length; ++i) {
            temp_result = this.solver.solve(not_marked[i].description, not_marked[i].row);
            if (temp_result == 3 /* error */)
                return 3 /* error */;
            if (temp_result == 1 /* changed */)
                result = temp_result;
            this.merge_rows(row, not_marked[i].row);
        }
        return result;
    };

    Row_Splitter.prototype.extract_not_marked_parts = function (description, row) {
        var result = [];
        var fragments = row.extract_fragments(is_marked);

        if (fragments.length == 0)
            return result;

        //adds guards to fragments so you can easily iterate
        fragments.unshift(Fragment.from_left_bound_and_length(row.left_bound - 2, 1, description.left_bound - 1));
        fragments.push(Fragment.from_left_bound_and_length(row.right_bound + 2, 1, description.right_bound + 1));

        var temp_desc, temp_row;
        var left_fragment, right_fragment;
        var temp_fragment;
        var f;

        for (var i = 1; i < fragments.length; ++i) {
            left_fragment = fragments[i - 1];
            right_fragment = fragments[i];

            if (right_fragment.value - left_fragment.value < 2)
                continue;

            temp_desc = description.clone();
            temp_desc.left_bound = left_fragment.value + 1;
            temp_desc.right_bound = right_fragment.value - 1;

            temp_row = row.clone();
            temp_row.left_bound = left_fragment.right_bound + 2;
            temp_row.right_bound = right_fragment.left_bound - 2;

            temp_fragment = Fragment.from_left_bound_and_length(right_fragment.right_bound, 1, -3 /* empty */, temp_row).extend_left_side_until(is_blocked, description.get_or_default(right_fragment.value, 1));
            temp_fragment.right_bound = right_fragment.left_bound - 1;
            this.clear_cells_that_could_be_part_of(temp_fragment);

            temp_fragment = Fragment.from_left_bound_and_length(left_fragment.left_bound, 1, -3 /* empty */, temp_row).extend_right_side_until(is_blocked, description.get_or_default(left_fragment.value, 1));
            temp_fragment.left_bound = left_fragment.right_bound + 1;
            this.clear_cells_that_could_be_part_of(temp_fragment);

            result.push(new Tier(temp_desc, temp_row));
        }
        return result;
    };
    Row_Splitter.prototype.clear_cells_that_could_be_part_of = function (fragment) {
        //fragment.fill(is_full);
        var f = fragment.extract_fully_contained_fragments(is_full);
        f.forEach(function (element, index, array) {
            element.value = -3 /* empty */;
            element.fill();
        });
    };
    Row_Splitter.prototype.merge_rows = function (base_row, added_row) {
        base_row.embed(added_row, full_over_empty_or_a);
    };
    return Row_Splitter;
})();
var Dummy_Splitter = (function () {
    function Dummy_Splitter() {
    }
    Dummy_Splitter.prototype.solve = function (description, row) {
        return 2 /* unchanged */;
    };
    return Dummy_Splitter;
})();
///<reference path="helpers.ts"/>
var Left_Righter = (function () {
    function Left_Righter() {
    }
    Left_Righter.prototype.solve = function (description, row) {
        if (description.length() < 1)
            return 2 /* unchanged */;

        var result = 2 /* unchanged */;
        var left_row = row.clone();
        var right_row = row.clone();
        var last = row.left_bound - 2;
        var fragments;

        fragments = description.create_description_fragments(left_row);
        for (var i = 0; i < fragments.length; ++i) {
            fragments[i].move_left_bound_to(last + 2);
            if (fragments[i].found_place_moving_right(is_full_marked_or_empty))
                fragments[i].fill();
            else
                return 3 /* error */;
            last = fragments[i].right_bound;
        }

        last = row.right_bound + 2;
        fragments = description.create_description_fragments(right_row);

        for (var i = fragments.length - 1; i >= 0; --i) {
            fragments[i].move_right_bound_to(last - 2);
            if (fragments[i].found_place_moving_left(is_full_marked_or_empty))
                fragments[i].fill();
            last = fragments[i].left_bound;
        }

        left_row.embed(right_row, same_ids_yield_full_cell);
        left_row.embed(row, full_or_b);
        if (!row.array_equals(left_row.array)) {
            row.array = left_row.array;
            result = 1 /* changed */;
        }
        return result;
    };
    return Left_Righter;
})();
///<reference path="helpers.ts"/>
///<reference path="row_blocker.ts"/>
///<reference path="row_marker.ts"/>
///<reference path="marked_resolver.ts"/>
///<reference path="row_splitter.ts"/>
///<reference path="left_righter.ts"/>
var Row_Solver = (function () {
    function Row_Solver(splitter) {
        if (typeof splitter === "undefined") { splitter = new Row_Splitter(); }
        this.blocker = new Row_Blocker();
        this.marker = new Row_Marker();
        this.resolver = new Marked_Resolver();
        this.splitter = splitter;
        this.left_righter = new Left_Righter();
    }
    Row_Solver.prototype.solve = function (description, row) {
        var result = 2 /* unchanged */;
        var temp_result;

        temp_result = this.blocker.solve(description, row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;
        else if (temp_result == 1 /* changed */)
            result = 1 /* changed */;

        temp_result = this.marker.solve(description, row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;

        temp_result = this.resolver.solve(description, row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;
        else if (temp_result == 1 /* changed */)
            result = 1 /* changed */;

        temp_result = this.splitter.solve(description, row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;
        else if (temp_result == 1 /* changed */)
            result = 1 /* changed */;

        temp_result = this.left_righter.solve(description, row);
        if (temp_result == 3 /* error */)
            return 3 /* error */;
        else if (temp_result == 1 /* changed */)
            result = 1 /* changed */;

        row.replace_all_with(is_marked, -1 /* full */);

        return result;
    };
    return Row_Solver;
})();

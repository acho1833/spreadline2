# SpreadLine Python to TypeScript Conversion Plan

## Overview
Convert the Python Flask `/fetchSpreadLine` API endpoint (which uses the SpreadLine library) to a Next.js App Router API endpoint `nodeFetchSpreadLine1`.

## Phase 1: Analysis & Setup
- [x] Analyze Python codebase structure
- [x] Understand data flow and transformations
- [x] Identify all Python modules to convert
- [ ] Create directory structure for TypeScript implementation

## Phase 2: Core Type Definitions
- [ ] Create TypeScript interfaces/types for:
  - [ ] Entity, Node, Session, Path classes
  - [ ] DataFrame-like structures
  - [ ] Configuration objects
  - [ ] Render output structure

## Phase 3: Utility Functions
- [ ] Convert helpers.py functions:
  - [ ] `str_to_datetime`, `datetime_to_str`, `get_time_array`
  - [ ] `_check_validity`, `_sparse_argsort`
- [ ] Convert constructors.py functions:
  - [ ] `filter_time_by_ego`
  - [ ] `construct_egocentric_network`
  - [ ] `find_within_constraints`, `_order_within`

## Phase 4: Core SpreadLine Class
- [ ] Convert spreadline.py SpreadLine class:
  - [ ] `load()` method
  - [ ] `center()` method
  - [ ] `configure()` method
  - [ ] `fit()` method
  - [ ] `_construct_entities()`, `_construct_contact_sessions()`, `_construct_timelines_idle_sessions()`, `_construct_tables()`

## Phase 5: Processing Pipeline
- [ ] Convert order.py - Ordering algorithm
- [ ] Convert align.py - Alignment algorithm
- [ ] Convert compact.py - Compacting algorithm
- [ ] Convert contextualize.py - Contextualization
- [ ] Convert render.py - Rendering

## Phase 6: Views/Endpoint Implementation
- [ ] Convert views.py helper functions:
  - [ ] `_construct_ego_networks`
  - [ ] `_construct_author_network`
  - [ ] `_remap_JH_affiliation`
- [ ] Create `computeJHSpreadLine()` equivalent
- [ ] Create Next.js API route handler

## Phase 7: Documentation (app/node-design2/)
- [ ] Create architecture document
- [ ] Document raw data structure
- [ ] Document data transformation pipeline
- [ ] Create sequence diagrams
- [ ] Create interactive visualizations
- [ ] Add sample input/output examples

## Phase 8: Testing & Verification
- [ ] Create demo comparison page
- [ ] Test API response against Python endpoint
- [ ] Fix any discrepancies
- [ ] Verify 100% match

## Key Files to Convert (Priority Order)
1. `SpreadLine/utils/types.py` - Core data structures (263 lines)
2. `SpreadLine/utils/helpers.py` - Utility functions (50 lines)
3. `SpreadLine/utils/constructors.py` - Network construction (128 lines)
4. `SpreadLine/spreadline.py` - Main orchestrator (347 lines)
5. `SpreadLine/order.py` - Ordering algorithm (155 lines)
6. `SpreadLine/align.py` - Alignment algorithm (177 lines)
7. `SpreadLine/compact.py` - Compacting algorithm (812 lines) - MOST COMPLEX
8. `SpreadLine/contextualize.py` - Context layout (149 lines)
9. `SpreadLine/render.py` - Rendering (575 lines)
10. `demo/backend/views.py` - API endpoint logic (320 lines)

**Total: ~2,976 lines of Python to convert to TypeScript**

## Technical Considerations
- NumPy arrays → TypeScript arrays/typed arrays
- Pandas DataFrames → Custom interfaces with array operations
- Scientific functions (KDE, argrelextrema) → Implement or approximate
- Time handling → JavaScript Date API
- Floating point precision → Consistent rounding

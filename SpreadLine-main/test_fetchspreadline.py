"""
Comprehensive Unit Test for /fetchSpreadLine Endpoint
This test traces the entire data transformation pipeline with detailed logging.

Run this test with:
    cd /workspaces/spreadline2/SpreadLine-main
    python test_fetchspreadline.py
"""

import sys
import os
import json
import pandas as pd
import numpy as np
from datetime import datetime

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(__file__))

from demo.backend.views import computeJHSpreadLine, _construct_author_network, _remap_JH_affiliation
from SpreadLine.spreadline import SpreadLine

class DataTransformationTracer:
    """Utility class to track and log data transformations"""

    def __init__(self, output_file='trace_log.json'):
        self.trace_log = []
        self.output_file = output_file
        self.step_counter = 0

    def log_step(self, step_name, description, data_snapshot=None, shape_info=None, sample_data=None):
        """Log a transformation step with relevant data"""
        self.step_counter += 1
        log_entry = {
            'step': self.step_counter,
            'name': step_name,
            'description': description,
            'timestamp': datetime.now().isoformat()
        }

        if shape_info:
            log_entry['shape'] = shape_info

        if sample_data:
            log_entry['sample_data'] = sample_data

        if data_snapshot:
            # Convert numpy/pandas objects to JSON-serializable format
            log_entry['data_snapshot'] = self._make_serializable(data_snapshot)

        self.trace_log.append(log_entry)

        # Print to console for real-time feedback
        print(f"\n{'='*80}")
        print(f"STEP {self.step_counter}: {step_name}")
        print(f"{'='*80}")
        print(f"Description: {description}")
        if shape_info:
            print(f"Shape: {shape_info}")
        if sample_data:
            print(f"Sample Data: {json.dumps(sample_data, indent=2)}")
        print(f"{'='*80}")

    def _make_serializable(self, obj):
        """Convert numpy/pandas objects to JSON-serializable format"""
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, pd.DataFrame):
            return obj.head(5).to_dict(orient='records')
        elif isinstance(obj, pd.Series):
            return obj.head(5).to_dict()
        elif isinstance(obj, dict):
            return {k: self._make_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, (list, tuple)):
            return [self._make_serializable(item) for item in obj]
        else:
            return str(obj)

    def save_trace(self):
        """Save the complete trace log to a JSON file"""
        with open(self.output_file, 'w') as f:
            json.dump(self.trace_log, f, indent=2)
        print(f"\n\nTrace log saved to: {self.output_file}")


def test_fetchspreadline_with_tracing():
    """
    Main test function that traces the entire /fetchSpreadLine pipeline
    """
    tracer = DataTransformationTracer(output_file='/workspaces/spreadline2/fetchspreadline_trace.json')

    print("\n" + "="*80)
    print("STARTING /fetchSpreadLine ENDPOINT TRACE")
    print("="*80)

    # Step 1: Load CSV Files
    tracer.log_step(
        "LOAD_CSV_FILES",
        "Loading all required CSV files for Jeffrey Heer's network",
        shape_info="4 CSV files"
    )

    ego = "Jeffrey Heer"
    path = 'case-studies/vis-author'

    # Load relations
    relations = pd.read_csv(f'{path}/relations.csv')
    tracer.log_step(
        "LOAD_RELATIONS",
        "Loaded relations.csv - contains co-authorship relationships",
        shape_info=f"Shape: {relations.shape}",
        sample_data=relations.head(3).to_dict(orient='records')
    )

    # Load entities
    entities = pd.read_csv(f'{path}/entities.csv')
    tracer.log_step(
        "LOAD_ENTITIES",
        "Loaded entities.csv - contains author affiliations",
        shape_info=f"Shape: {entities.shape}",
        sample_data=entities.head(3).to_dict(orient='records')
    )

    # Load citations
    citations = pd.read_csv(f'{path}/citations.csv')
    tracer.log_step(
        "LOAD_CITATIONS",
        "Loaded citations.csv - contains citation counts per paper",
        shape_info=f"Shape: {citations.shape}",
        sample_data=citations.head(3).to_dict(orient='records')
    )

    # Load content layout
    layout = pd.read_csv(f'{path}/Heer/content.csv')
    tracer.log_step(
        "LOAD_CONTENT_LAYOUT",
        "Loaded Heer/content.csv - contains precomputed 2D positions for authors",
        shape_info=f"Shape: {layout.shape}",
        sample_data=layout.head(3).to_dict(orient='records')
    )

    # Step 2: Construct Author Network
    tracer.log_step(
        "CONSTRUCT_AUTHOR_NETWORK_START",
        "Starting egocentric network construction for Jeffrey Heer"
    )

    relations['year'] = relations['year'].apply(lambda x: str(x))
    entities_working = entities.copy()
    entities_working['year'] = entities_working['year'].apply(lambda x: str(x))

    network, lineColor, groups = _construct_author_network(ego, _remap_JH_affiliation,
                                                            relationsPath=f'{path}/relations.csv',
                                                            entitiesPath=f'{path}/entities.csv',
                                                            times=[])

    # Convert lineColor from Series to dict if needed
    if hasattr(lineColor, 'to_dict'):
        lineColor_dict = lineColor.to_dict()
    else:
        lineColor_dict = dict(lineColor)

    tracer.log_step(
        "CONSTRUCT_EGOCENTRIC_NETWORK",
        "Constructed 2-hop egocentric network centered on Jeffrey Heer",
        shape_info=f"Network shape: {network.shape}",
        sample_data={
            "network_sample": network.head(3).to_dict(orient='records'),
            "line_color_sample": dict(list(lineColor_dict.items())[:5]),
            "groups_sample": {k: [[str(item) for item in group] for group in v] for k, v in list(groups.items())[:2]}
        }
    )

    # Step 3: Initialize SpreadLine
    tracer.log_step(
        "INITIALIZE_SPREADLINE",
        "Creating SpreadLine instance and starting the pipeline"
    )

    SpreadLiner = SpreadLine()

    # Step 4: Load topology data
    tracer.log_step(
        "LOAD_TOPOLOGY",
        "Loading network topology into SpreadLine",
        sample_data={
            "config": {
                'source': 'source',
                'target': 'target',
                'time': 'year',
                'weight': 'count'
            }
        }
    )

    SpreadLiner.load(network, config={
        'source': 'source',
        'target': 'target',
        'time': 'year',
        'weight': 'count',
    })

    # Step 5: Load line colors
    tracer.log_step(
        "LOAD_LINE_COLORS",
        "Loading entity line colors (internal vs external collaborators)",
        sample_data={"sample_colors": dict(list(lineColor_dict.items())[:5])}
    )

    SpreadLiner.load(lineColor, config={
        'entity': 'entity',
        'color': 'color',
    }, key='line')

    # Step 6: Prepare node context (citations)
    papers = network['id'].unique().tolist()
    frames = []
    for paper in papers:
        group = citations.loc[citations['paperID'] == paper, :]
        for idx, row in group.iterrows():
            frames.append({
                'entity': row['name'],
                'time': str(row['year']),
                'context': int(row['citationcount'])
            })

    nodeContent = pd.DataFrame(frames).groupby(['entity', 'time']).agg({'context': 'sum'}).reset_index()

    tracer.log_step(
        "PREPARE_NODE_CONTEXT",
        "Aggregated citation counts per author per year",
        shape_info=f"Shape: {nodeContent.shape}",
        sample_data=nodeContent.head(5).to_dict(orient='records')
    )

    SpreadLiner.load(nodeContent, config={
        'time': 'time',
        'entity': 'entity',
        'context': 'context',
    }, key='node')

    # Step 7: Load content layout
    tracer.log_step(
        "LOAD_CONTENT_LAYOUT",
        "Loading 2D spatial layout for contextual positioning",
        shape_info=f"Shape: {layout.shape}"
    )

    SpreadLiner.load(layout, config={
        'timestamp': 'year',
        'id': 'name',
        'posX': 'posX',
        'posY': 'posY',
    }, key='content')

    # Step 8: Center on ego
    tracer.log_step(
        "CENTER_ON_EGO",
        f"Centering network on ego: {ego}",
        sample_data={
            "ego": ego,
            "timeDelta": "year",
            "timeFormat": "%Y"
        }
    )

    SpreadLiner.center(ego=ego, timeDelta='year', timeFormat='%Y', groups=groups)

    tracer.log_step(
        "POST_CENTER_STATE",
        "After centering - entities and sessions created",
        sample_data={
            "num_entities": len(SpreadLiner.entities),
            "num_sessions": len(SpreadLiner.sessions),
            "num_timestamps": SpreadLiner._counts['numAllTimestamps'],
            "entity_names_sample": SpreadLiner.entities_names[:5],
            "time_range": [SpreadLiner._all_timestamps[0], SpreadLiner._all_timestamps[-1]]
        }
    )

    # Step 9: Configure
    tracer.log_step(
        "CONFIGURE",
        "Configuring optimization parameters",
        sample_data={
            "squeezeSameCategory": True,
            "minimize": "wiggles"
        }
    )

    SpreadLiner.configure({"squeezeSameCategory": True, "minimize": "wiggles"})

    # Step 10: Fit - Run the pipeline
    tracer.log_step(
        "FIT_PIPELINE_START",
        "Starting the 5-phase optimization pipeline",
        sample_data={
            "width": 2800,
            "height": 1000
        }
    )

    # Phase 1: Ordering
    tracer.log_step(
        "PHASE_1_ORDERING",
        "Running crossing reduction algorithm using barycenter heuristic"
    )

    # Phase 2: Aligning
    tracer.log_step(
        "PHASE_2_ALIGNING",
        "Maximizing straight lines using longest common substring algorithm"
    )

    # Phase 3: Compacting
    tracer.log_step(
        "PHASE_3_COMPACTING",
        "Minimizing line wiggles or whitespace based on configuration"
    )

    # Phase 4: Contextualizing
    tracer.log_step(
        "PHASE_4_CONTEXTUALIZING",
        "Processing attribute-driven layout (PCA/predefined positions)"
    )

    # Phase 5: Rendering
    tracer.log_step(
        "PHASE_5_RENDERING",
        "Converting to SVG paths and screen coordinates"
    )

    result = SpreadLiner.fit(width=2800, height=1000)

    tracer.log_step(
        "FIT_PIPELINE_COMPLETE",
        "Optimization pipeline completed successfully",
        sample_data={
            "result_keys": list(result.keys()),
            "num_storylines": len(result.get('storylines', [])),
            "num_blocks": len(result.get('blocks', [])),
            "num_time_labels": len(result.get('timeLabels', [])),
            "band_width": result.get('bandWidth'),
            "height_extents": result.get('heightExtents')
        }
    )

    # Step 11: Add reference data
    reference = pd.read_csv(f'{path}/Heer/content_reference.csv')
    result.update({"mode": "author", 'reference': reference.to_dict(orient='records')})

    tracer.log_step(
        "ADD_REFERENCE_DATA",
        "Added reference content and mode metadata",
        sample_data={
            "mode": "author",
            "reference_count": len(reference)
        }
    )

    # Step 12: Save final result
    tracer.log_step(
        "FINAL_RESULT",
        "Complete endpoint response ready",
        sample_data={
            "result_summary": {
                "ego": result.get('ego'),
                "mode": result.get('mode'),
                "num_storylines": len(result.get('storylines', [])),
                "num_blocks": len(result.get('blocks', [])),
                "num_time_labels": len(result.get('timeLabels', [])),
                "band_width": result.get('bandWidth'),
                "height_extents": result.get('heightExtents'),
                "block_width": result.get('blockWidth')
            }
        }
    )

    # Save complete result
    with open('/workspaces/spreadline2/fetchspreadline_result.json', 'w') as f:
        # Convert numpy arrays and other non-serializable objects
        serializable_result = {}
        for key, value in result.items():
            if isinstance(value, (list, dict, str, int, float, bool, type(None))):
                serializable_result[key] = value
            else:
                serializable_result[key] = str(value)
        json.dump(serializable_result, f, indent=2)

    print("\n" + "="*80)
    print("Complete result saved to: /workspaces/spreadline2/fetchspreadline_result.json")
    print("="*80)

    # Save trace log
    tracer.save_trace()

    return result


if __name__ == "__main__":
    print("\n" + "#"*80)
    print("# fetchSpreadLine Endpoint Test with Detailed Tracing")
    print("#"*80)

    try:
        result = test_fetchspreadline_with_tracing()
        print("\n✅ TEST COMPLETED SUCCESSFULLY!")
        print(f"\nGenerated {len(result.get('storylines', []))} storylines")
        print(f"Generated {len(result.get('blocks', []))} blocks")
        print(f"Time labels: {len(result.get('timeLabels', []))}")
    except Exception as e:
        print(f"\n❌ TEST FAILED WITH ERROR:")
        print(f"{type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

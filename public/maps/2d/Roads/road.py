import osmnx as ox
import matplotlib.pyplot as plt
import json

# Try these place/address queries in order (pick the first that works well)
queries = [
    "Indian Institute of Technology Ropar, Rupnagar, Punjab, India",  # Full official name – often best
    "IIT Ropar, Rupnagar, Punjab, India",
    "IIT Ropar Main Campus, Bara Phool, Rupnagar, Punjab, India",
    "IIT Ropar, Nangal Road, Rupnagar, Punjab, India"
]

G = None
for q in queries:
    try:
        print(f"Trying: {q}")
        G = ox.graph_from_place(q, network_type="all", simplify=True, retain_all=False)
        if len(G.nodes) > 50:
            print(f"Success! Nodes: {len(G.nodes)}, Edges: {len(G.edges)}")
            break
        else:
            print(f"Graph too small ({len(G.nodes)} nodes) – skipping")
    except Exception as e:
        print(f"Failed for '{q}': {e}")
        continue

# Fallback: Use address lookup
if G is None:
    try:
        print("Falling back to graph_from_address...")
        G = ox.graph_from_address(
            "Indian Institute of Technology Ropar, Rupnagar, Punjab 140001, India",
            network_type="all",
            dist=2000
        )
        print(f"Address fallback success! Nodes: {len(G.nodes)}, Edges: {len(G.edges)}")
    except Exception as e:
        print(f"Address fallback failed: {e}")

# Strong fallback: Bounding box around campus
if G is None or len(G.nodes) < 100:
    print("Using bounding box fallback...")
    north = 30.985
    south = 30.955
    east  = 76.490
    west  = 76.455
    G = ox.graph_from_bbox(north, south, east, west, network_type="all")
    print(f"Bounding box success! Nodes: {len(G.nodes)}, Edges: {len(G.edges)}")

if G is not None:
    print(ox.basic_stats(G))

    # ── 1. Plot the road network ──────────────────────────────
    fig, ax = ox.plot_graph(
        G,
        node_size=0,
        edge_linewidth=1.0,
        edge_color="#1f78b4",
        bgcolor="white",
        show=False,
        close=False
    )
    plt.title("Road Network around IIT Ropar Campus")
    plt.tight_layout()
    plt.savefig("iit_ropar_roads.png", dpi=300, bbox_inches="tight")
    # plt.show()

    # ── 2. Raw edges as GeoJSON (for QGIS / geojson.io inspection) ──
    gdf_edges = ox.graph_to_gdfs(G, nodes=False, edges=True)
    gdf_edges = gdf_edges.to_crs(epsg=4326)
    gdf_edges.to_file("iit_ropar_roads.geojson", driver="GeoJSON")

    gdf_nodes = ox.graph_to_gdfs(G, nodes=True, edges=False)
    gdf_nodes.to_file("iit_ropar_nodes.geojson", driver="GeoJSON")

    # ── 3. Buffered road POLYGONS — width per OSM highway type ──
    # Half-widths in metres (final rendered road ≈ 2× this value)
    HIGHWAY_WIDTH = {
        'motorway': 10, 'trunk': 8, 'primary': 6,
        'secondary': 5, 'tertiary': 4, 'unclassified': 3,
        'residential': 3, 'service': 2,
        'footway': 1, 'path': 1, 'track': 1.5, 'cycleway': 1.5,
        'steps': 0.8, 'pedestrian': 2,
    }
    DEFAULT_WIDTH = 2  # metres for any unlisted type

    gdf_proj = gdf_edges.to_crs(epsg=32644).copy()   # UTM Zone 44N (metres, covers Punjab)

    def get_half_width(hw):
        """OSM highway value can be a string or a list (aggregated edges)."""
        if isinstance(hw, list):
            hw = hw[0]
        if not isinstance(hw, str):
            return DEFAULT_WIDTH
        return HIGHWAY_WIDTH.get(hw, DEFAULT_WIDTH)

    gdf_proj['buf'] = gdf_proj['highway'].apply(get_half_width)
    gdf_proj['geometry'] = gdf_proj.apply(
        lambda row: row.geometry.buffer(row['buf']), axis=1
    )
    gdf_poly = gdf_proj.to_crs(epsg=4326)

    # Keep highway tag for the line-mode style in index.html
    keep = ['geometry', 'highway'] if 'highway' in gdf_poly.columns else ['geometry']
    dissolved = gdf_poly[keep].dissolve()
    dissolved.to_file("campus_roads_poly.geojson", driver="GeoJSON")
    print("campus_roads_poly.geojson saved  (per-road-type widths)")


    # ── 4. paths.json — node/edge graph for Dijkstra routing ──
    node_id_map = {}
    nodes_out   = []
    next_node_id = 0
    for osm_id, data in G.nodes(data=True):
        node_id_map[osm_id] = next_node_id
        nodes_out.append({
            "id":  next_node_id,
            "lat": round(data["y"], 8),   # osmnx stores lat as y
            "lng": round(data["x"], 8)    # osmnx stores lng as x
        })
        next_node_id += 1

    edges_out = []
    seen = set()
    for u, v, data in G.edges(data=True):
        a = node_id_map.get(u)
        b = node_id_map.get(v)
        if a is None or b is None:
            continue
            
        key = frozenset([u, v])
        if key in seen:
            continue
        seen.add(key)
        
        if 'geometry' in data:
            # Unpack curve geometry into discrete tracking nodes
            coords = list(data['geometry'].coords)
            prev_id = a
            for lon, lat in coords[1:-1]:
                new_id = next_node_id
                next_node_id += 1
                nodes_out.append({
                    "id": new_id,
                    "lat": round(lat, 8),
                    "lng": round(lon, 8)
                })
                edges_out.append({"from": prev_id, "to": new_id})
                prev_id = new_id
            edges_out.append({"from": prev_id, "to": b})
        else:
            edges_out.append({"from": a, "to": b})

    with open("paths.json", "w") as f:
        json.dump({"nodes": nodes_out, "edges": edges_out}, f, indent=2)

    print(f"paths.json saved — {len(nodes_out)} nodes, {len(edges_out)} edges")
    print("\nCopy these two files to public/maps/2d/Roads/:")
    print("  campus_roads_poly.geojson  (visual overlay)")
    print("  paths.json                 (navigation routing)")
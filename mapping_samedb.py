import json
from pymongo import MongoClient
from bson import ObjectId
# Connect to the old database (inside Docker container)
client = MongoClient('mongodb://localhost:27017/')
db = client['urban_water']

# Define the schema mapping
schema_mapping = {
    # "old_column_name": "new_column_name",
    # "old_column_name2": "new_column_name2",
    "surveyNode": "survey_node",
    "minimapNode":"minimap_node",
    "xPixelOffset":	"x",
    "xPixelPerMeter":"x_scale",
    "yPixelOffset":	"y",
    "yPixelPerMeter":"y_scale",
    "nodeNumber": "node_number",
    "surveyNode": "survey_node",
    "tilesName": "tiles_name",
    "tilesId": "tiles_id",
    "linkHotspots": "link_hotspots",
    "infoHotspots": "info_hotspots",
    "surveyName": "survey_name",
    "nodeNumber": "node_number",
    "mantaLink": "manta_link",
    "tilesId": "tiles_id",
    "tilesName": "tiles_name",
    "faceSize": "face_size",
    "initialParameters": "initial_parameters"

    # ...
}
# Define the default values for new columns
default_values = {
    "site": ObjectId("5e44e4bfe8b8974459eafba1"),
   
    # ...
}

collection_mapping = {
    # "old_collection_name": "new_collection_name",

    "hotspotdescription": "hotspot_description",
    "minimapconversions": "minimap_conversions",
    "minimapnodes":	"minimap_nodes",
    "surveynodes":	"survey_nodes",
    }

# Define a function to transform the data
# Define a function to transform the data
def transform_data(old_data):
    new_data = {}
    for old_key, new_key in schema_mapping.items():
        if old_key in old_data:
            new_data[new_key] = old_data.pop(old_key)  # Move data from old key to new key
    new_data.update(old_data)  # Add remaining data from old_data
    for new_key, default_value in default_values.items():
        if new_key not in new_data:
            new_data[new_key] = default_value  # Add default values for missing columns
    # Removed the line that deletes the '_id' field
    return new_data



# Migrate data from old to new collection within the same database
for old_collection_name, new_collection_name in collection_mapping.items():
    old_collection = db[old_collection_name]
    new_collection = db[new_collection_name]

    for old_data in old_collection.find():
        new_data = transform_data(old_data)
        new_collection.insert_one(new_data)

print("Mapping done!")

# Insert documents
collectionTitles = {'sites': 'agco360.sites.json', 'minimap_images': 'urban_water.minimap_images.json', 'site_settings':'camphill.site_settings.json'}

for key in collectionTitles:
    collection_name = key
    with open(collectionTitles[key]) as file:
        file_data = json.load(file)
    if isinstance(file_data, list):
        for item in file_data:
            if '_id' not in item:
                item['_id'] = str(ObjectId())  # Generate a new ObjectID if _id is missing
        db[str(key)].insert_many(file_data)
    else:
        if '_id' not in file_data:
            file_data['_id'] = str(ObjectId())  # Generate a new ObjectID if _id is missing
        db[str(key)].insert_one(file_data)

print("insert documents done!")

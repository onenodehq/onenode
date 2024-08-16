def extract_update_path_and_value(update):
    extracted_paths = []

    # Iterate through the update operators (e.g., $set, $unset)
    for operator, fields in update.items():
        # Ensure the operator is one that involves setting fields
        if operator in {"$set", "$unset"}:
            for path, value in fields.items():
                extracted_paths.append((path, value))

    return extracted_paths

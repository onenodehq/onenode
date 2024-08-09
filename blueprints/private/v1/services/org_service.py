from flask import g
from blueprints.v1.utils.mongo_setup import (
    mongo_orgs,
    mongo_projects,
)


def create_default_org_and_project_service(onenode_id: str):
    org = mongo_orgs.find_one({"members": {"$in": [onenode_id]}})
    if not org:
        new_project = mongo_projects.insert_one(
            {"members": [onenode_id], "collections": []}
        )
        new_project_id = new_project.inserted_id
        mongo_orgs.insert_one({"members": [onenode_id], "projects": [new_project_id]})
        return


def get_orgs_and_projects_servie():
    onenode_id = g.onenode_id
    orgs_cursor = mongo_orgs.find({"members": {"$in": [onenode_id]}})
    orgs = list(orgs_cursor)

    if not orgs:
        raise ValueError("Organization not found for the given onenode_id")

    result: list = []
    for org in orgs:
        if not org.get("name"):
            org["name"] = "Default Organization"
        project_ids = org.get("projects")
        projects_cursor = mongo_projects.find({"_id": {"$in": project_ids}})
        projects = list(projects_cursor)

        for project in projects:
            if not project.get("name"):
                project["name"] = "Default Project"
                break

        result.append(
            {
                "_id": org["_id"],
                "name": org["name"],
                "projects": [
                    {"_id": project["_id"], "name": project["name"]}
                    for project in projects
                ],
            }
        )
    return result

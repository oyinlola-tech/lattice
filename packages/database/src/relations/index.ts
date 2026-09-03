/**
 * @zudoliblib/database — Relations
 *
 * Entity relation definitions and registry.
 */

export {
  oneToOne,
  oneToMany,
  manyToOne,
  manyToMany,
  includeRelation,
  includeRelations,
  RelationRegistry,
  createRelationRegistry,
  validateRelation,
  isRelationType,
  isCollectionRelation,
  isSingleRelation,
  type RelationDefinition,
  type RelationType,
  type RelationLoadOptions,
  type RelationInclude,
} from "./relations.definition.js";

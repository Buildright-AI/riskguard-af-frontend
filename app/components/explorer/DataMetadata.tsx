"use client";

import React, { useEffect, useState } from "react";

import { getMappingTypes } from "@/app/api/getMappingTypes";
import { UseCollectionMetadataEditorReturn } from "./hooks/useCollectionMetadataEditor";
import MetadataSummaryEditor from "./components/MetadataSummaryEditor";
import MetadataMappingsEditor from "./components/MetadataMappingsEditor";
import MetadataFieldsDisplay from "./components/MetadataFieldsEditor";
import { MappingTypesPayload, MetadataPayload } from "@/app/types/payloads";
import { motion } from "framer-motion";

interface DataMetadataProps {
  collectionMetadata: MetadataPayload | null;
  metadataEditor: UseCollectionMetadataEditorReturn;
  collectionDataProperties: { [key: string]: string };
}

const DataMetadata: React.FC<DataMetadataProps> = ({
  collectionMetadata,
  metadataEditor,
  collectionDataProperties,
}) => {
  const [mappingTypes, setMappingTypes] = useState<
    Record<string, Record<string, string>>
  >({});
  const [mappingTypeDescriptions, setMappingTypeDescriptions] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    // Fetch mapping types on mount
    getMappingTypes().then((res: MappingTypesPayload) => {
      if (!res.error) {
        setMappingTypes(
          res.mapping_types.reduce(
            (acc, curr) => {
              acc[curr.name] = curr.fields;
              return acc;
            },
            {} as Record<string, Record<string, string>>
          )
        );
        setMappingTypeDescriptions(
          res.mapping_types.reduce(
            (acc, curr) => {
              acc[curr.name] = curr.description;
              return acc;
            },
            {} as Record<string, string>
          )
        );
      }
    });
  }, []);

  return (
    <motion.div className="flex flex-1 min-h-0 min-w-0 overflow-auto mb-10 flex-col w-full gap-4">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.3,
          type: "tween",
          delay: 0.2,
        }}
      >
        <MetadataSummaryEditor
          summary={collectionMetadata?.metadata.summary || ""}
          editing={metadataEditor.editingSummary}
          summaryDraft={metadataEditor.summaryDraft}
          saving={metadataEditor.savingSummary}
          hasChanges={metadataEditor.hasSummaryChanges}
          onEdit={() => metadataEditor.setEditingSummary(true)}
          onChange={metadataEditor.setSummaryDraft}
          onSave={metadataEditor.handleSaveSummary}
          onCancel={() => {
            metadataEditor.setEditingSummary(false);
            metadataEditor.setSummaryDraft(
              collectionMetadata?.metadata.summary || ""
            );
          }}
        />
      </motion.div>

      {/* Mappings */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.3,
          type: "tween",
          delay: 0.3,
        }}
      >
        <MetadataMappingsEditor
          editing={metadataEditor.editingMappings}
          mappingsDraft={metadataEditor.mappingsDraft}
          mappingTypes={mappingTypes}
          mappingTypeDescriptions={mappingTypeDescriptions}
          collectionDataProperties={collectionDataProperties}
          onEdit={() => metadataEditor.setEditingMappings(true)}
          onSave={metadataEditor.handleSaveMappings}
          onCancel={() => metadataEditor.setEditingMappings(false)}
          onAddGroup={metadataEditor.handleAddGroup}
          onRemoveGroup={metadataEditor.handleRemoveGroup}
          onMappingChange={metadataEditor.handleMappingChange}
          saving={metadataEditor.savingMappings}
          hasChanges={metadataEditor.hasMappingsChanges}
          currentMappings={collectionMetadata?.metadata.mappings || {}}
        />
      </motion.div>

      {/* Field Metadata */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.3,
          type: "tween",
          delay: 0.4,
        }}
      >
        <MetadataFieldsDisplay
          fields={collectionMetadata?.metadata.fields || {}}
        />
      </motion.div>
    </motion.div>
  );
};

export default DataMetadata;

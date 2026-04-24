import React from "react";
import "./DescriptionBox.css";
import { useTranslation } from "react-i18next";

const DescriptionBox = ({ jig }) => {
  const { t } = useTranslation();

  return (
    <div className="description-box">
      <div className="tab-header">{t('product.descriptionTab')}</div>
      <div className="content">
        
        {/* Description */}
        {jig?.description ? (
          <p>{jig.description}</p>
        ) : (
          <p>{t('product.noDescription')}</p>
        )}

        {/* Weight Information */}
        {jig?.weight && (
          <p>
            <strong>{t('product.weightLabel')}:</strong> {jig.weight.label}
          </p>
        )}

        {/* Category Information */}
        {jig?.category && (
          <p>
            <strong>{t('product.categoryLabel')}:</strong> {jig.category.name}
          </p>
        )}
      </div>
    </div>
  );
}

export default DescriptionBox
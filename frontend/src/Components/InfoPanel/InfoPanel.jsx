import "./InfoPanel.css";
import { useTranslation } from "react-i18next";

const InfoPanel = () => {
  const { t } = useTranslation();

  return (
    <section className="squid-info">
      <h2>{t('info.title')}</h2>

      <div className="info-grid-squid">
        <div className="info-card">
          <h3>{t('info.season.label')}</h3>
          <p>
            {t('info.season.text_part1')} <strong>{t('info.season.bold')}</strong> {t('info.season.text_part2')}
          </p>
        </div>

        <div className="info-card">
          <h3>{t('info.time.label')}</h3>
          <p>
            {t('info.time.text_part1')} <strong>{t('info.time.bold1')}</strong> {t('info.time.text_part2')} <strong>{t('info.time.bold2')}</strong> {t('info.time.text_part3')}
          </p>
        </div>

        <div className="info-card">
          <h3>{t('info.locations.label')}</h3>
          <p>
            {t('info.locations.text_part1')} <strong>{t('info.locations.bold')}</strong>.
          </p>
        </div>
      </div>
    </section>
  )
}

export default InfoPanel
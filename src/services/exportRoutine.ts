import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Routine, Child } from '../types';
import { COLORS, FONT_SIZE, SPACING } from '../constants/theme';

interface ExportOptions {
  format?: 'pdf' | 'print';
  fileName?: string;
}

/**
 * Génère un PDF blob avec la structure complète (résumé + étapes)
 * Utilisé à la fois pour le téléchargement et l'impression
 */
async function generateRoutinePDFBlob(routine: Routine, child: Child): Promise<jsPDF> {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Page 1 : Résumé (en paysage)
  const summaryContainer = createSummaryPage(routine, child);
  document.body.appendChild(summaryContainer);

  const summaryCanvas = await html2canvas(summaryContainer, {
    scale: 2,
    backgroundColor: '#FFFFFF',
    useCORS: true,
  });

  const summaryImgData = summaryCanvas.toDataURL('image/png');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth - 20;
  const imgHeight = (summaryCanvas.height * imgWidth) / summaryCanvas.width;

  pdf.addImage(summaryImgData, 'PNG', 10, 10, imgWidth, imgHeight);
  document.body.removeChild(summaryContainer);

  // Pages suivantes : 1 étape par page en paysage
  for (let i = 0; i < routine.steps.length; i++) {
    const step = routine.steps[i];
    const stepContainer = createStepPage(routine, child, step, i + 1, routine.steps.length);
    document.body.appendChild(stepContainer);

    const stepCanvas = await html2canvas(stepContainer, {
      scale: 2,
      backgroundColor: '#FFFFFF',
      useCORS: true,
    });

    // Ajouter une nouvelle page en paysage
    pdf.addPage('a4', 'landscape');
    const landscapeWidth = pdf.internal.pageSize.getWidth();
    const landscapeHeight = pdf.internal.pageSize.getHeight();
    const stepImgWidth = landscapeWidth - 20;
    const stepImgHeight = (stepCanvas.height * stepImgWidth) / stepCanvas.width;

    pdf.addImage(stepCanvas.toDataURL('image/png'), 'PNG', 10, 10, stepImgWidth, stepImgHeight);
    document.body.removeChild(stepContainer);
  }

  return pdf;
}

/**
 * Exporte une routine en PDF multi-page (téléchargement)
 * Page 1 : Résumé compact de toutes les étapes
 * Pages suivantes : 1 étape par page en paysage
 */
export async function exportRoutineToPDF(
  routine: Routine,
  child: Child,
  options: ExportOptions = {}
) {
  const { fileName = `${routine.name}-${child.name}` } = options;

  try {
    const pdf = await generateRoutinePDFBlob(routine, child);
    pdf.save(`${fileName}.pdf`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    throw error;
  }
}

/**
 * Imprime une routine (ouvre la boîte de dialogue d'impression avec le même contenu que le PDF)
 */
export async function printRoutine(routine: Routine, child: Child) {
  try {
    const printWindow = window.open('', '', 'height=800,width=1000');

    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
    }

    // Générer le contenu HTML avec les mêmes pages que le PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${routine.name}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: white;
            }
            .page {
              page-break-after: always;
              padding: 15px 20px;
              width: 100%;
              min-height: 100vh;
            }
            @page {
              margin: 0;
              size: A4 landscape;
            }
            @media print {
              .page {
                page-break-after: always;
                page-break-inside: avoid;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
    `;

    // Page 1 : Résumé
    const summaryContainer = createSummaryPage(routine, child);
    document.body.appendChild(summaryContainer);
    htmlContent += `<div class="page">${summaryContainer.innerHTML}</div>`;

    // Pages d'étapes
    for (let i = 0; i < routine.steps.length; i++) {
      const step = routine.steps[i];
      const stepContainer = createStepPage(routine, child, step, i + 1, routine.steps.length);
      document.body.appendChild(stepContainer);
      htmlContent += `<div class="page">${stepContainer.innerHTML}</div>`;
    }

    htmlContent += `
        </body>
      </html>
    `;

    // Écrire le contenu dans la fenêtre
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    // Nettoyer le DOM
    const containers = document.querySelectorAll('[style*="position: absolute"][style*="left: -9999px"]');
    containers.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    // Ouvrir la boîte de dialogue d'impression
    setTimeout(() => {
      printWindow.print();
    }, 500);

    return true;
  } catch (error) {
    console.error('Erreur lors de l\'impression:', error);
    throw error;
  }
}

/**
 * Crée la page 1 : Résumé compact en paysage avec toutes les étapes
 */
function createSummaryPage(routine: Routine, child: Child): HTMLDivElement {
  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: -9999px;
    background: white;
    padding: 15px 20px;
    width: 1122px;
    height: 793px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    flex-direction: column;
  `;

  // En-tête
  const header = document.createElement('div');
  header.style.cssText = `
    text-align: center;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 3px solid ${routine.color || '#F5D4A8'};
  `;

  const title = document.createElement('h1');
  title.style.cssText = `
    font-size: 24px;
    font-weight: 800;
    color: #1a1a1a;
    margin: 0 0 4px 0;
  `;
  title.textContent = routine.name;

  const subtitle = document.createElement('p');
  subtitle.style.cssText = `
    font-size: 12px;
    color: #666;
    margin: 0;
  `;
  subtitle.textContent = `Pour: ${child.name}`;

  header.appendChild(title);
  header.appendChild(subtitle);
  container.appendChild(header);

  // Infos récapitulatives (3 colonnes)
  const info = document.createElement('div');
  info.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
    padding: 12px;
    background: #FFF8F0;
    border-radius: 6px;
  `;

  const infoItem = (label: string, value: string) => {
    const div = document.createElement('div');
    div.style.cssText = `text-align: center;`;
    const lbl = document.createElement('p');
    lbl.style.cssText = `font-size: 10px; color: #999; text-transform: uppercase; font-weight: 600; margin: 0 0 2px 0;`;
    lbl.textContent = label;
    const val = document.createElement('p');
    val.style.cssText = `font-size: 14px; font-weight: 700; color: #1a1a1a; margin: 0;`;
    val.textContent = value;
    div.appendChild(lbl);
    div.appendChild(val);
    return div;
  };

  info.appendChild(infoItem('Durée totale', `${getTotalDuration(routine)} min`));
  info.appendChild(infoItem('Étapes', String(routine.steps.length)));
  info.appendChild(infoItem('Moment', routine.category));
  container.appendChild(info);

  // Titre étapes
  const stepsTitle = document.createElement('h2');
  stepsTitle.style.cssText = `
    font-size: 14px;
    font-weight: 800;
    color: #1a1a1a;
    margin: 8px 0 8px 0;
    padding-bottom: 6px;
    border-bottom: 2px solid #F5D4A8;
  `;
  stepsTitle.textContent = 'Étapes';
  container.appendChild(stepsTitle);

  // Tableau résumé des étapes (2 colonnes)
  const table = document.createElement('div');
  table.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    flex: 1;
    overflow-y: auto;
  `;

  routine.steps.forEach((step, index) => {
    const row = document.createElement('div');
    row.style.cssText = `
      display: grid;
      grid-template-columns: 32px 1fr 45px 70px;
      gap: 8px;
      align-items: center;
      padding: 8px;
      background: #FFFBF7;
      border-left: 3px solid ${routine.color || '#F5D4A8'};
      border-radius: 3px;
      font-size: 11px;
    `;

    const numBadge = document.createElement('div');
    numBadge.style.cssText = `
      background: ${routine.color || '#F5D4A8'};
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 11px;
      flex-shrink: 0;
    `;
    numBadge.textContent = String(index + 1);

    const stepTitle = document.createElement('div');
    stepTitle.style.cssText = `
      font-weight: 700;
      color: #1a1a1a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    stepTitle.textContent = step.title;

    const duration = document.createElement('div');
    duration.style.cssText = `
      text-align: center;
      color: #666;
      font-weight: 600;
    `;
    duration.textContent = `${step.durationMinutes}m`;

    const status = document.createElement('div');
    status.style.cssText = `
      text-align: right;
      color: ${step.isRequired ? '#2E7D32' : '#999'};
      font-weight: 600;
      font-size: 10px;
    `;
    status.textContent = step.isRequired ? 'Obligatoire' : 'Facultatif';

    row.appendChild(numBadge);
    row.appendChild(stepTitle);
    row.appendChild(duration);
    row.appendChild(status);
    table.appendChild(row);
  });

  container.appendChild(table);

  // Pied de page
  const footer = document.createElement('div');
  footer.style.cssText = `
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid #ddd;
    text-align: center;
    color: #999;
    font-size: 10px;
    flex-shrink: 0;
  `;
  footer.textContent = `Routine générée le ${new Date().toLocaleDateString('fr-FR')}`;
  container.appendChild(footer);

  return container;
}

/**
 * Crée une page d'étape en paysage (landscape) avec design amélioré et coloré
 */
function createStepPage(
  routine: Routine,
  child: Child,
  step: any,
  stepNumber: number,
  totalSteps: number
): HTMLDivElement {
  const container = document.createElement('div');
  const bgColor = `${routine.color}15`; // Version très claire pour le fond
  
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: -9999px;
    background: white;
    width: 1122px;
    height: 793px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;

  // Bande colorée d'en-tête
  const headerBand = document.createElement('div');
  headerBand.style.cssText = `
    background: linear-gradient(135deg, ${routine.color} 0%, ${routine.color}dd 100%);
    padding: 20px 40px;
    text-align: center;
    color: white;
    border-bottom: 5px solid ${routine.color};
  `;

  const progress = document.createElement('p');
  progress.style.cssText = `
    font-size: 12px;
    margin: 0 0 5px 0;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.9;
  `;
  progress.textContent = `Étape ${stepNumber} de ${totalSteps}`;

  const routineInfo = document.createElement('p');
  routineInfo.style.cssText = `
    font-size: 13px;
    margin: 0;
    font-weight: 500;
    opacity: 0.95;
  `;
  routineInfo.textContent = `${routine.name} · Pour ${child.name}`;

  headerBand.appendChild(progress);
  headerBand.appendChild(routineInfo);
  container.appendChild(headerBand);

  // Contenu principal
  const main = document.createElement('div');
  main.style.cssText = `
    padding: 30px 50px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 0;
  `;

  // Titre principal
  const titleBox = document.createElement('div');
  titleBox.style.cssText = `
    text-align: center;
    margin-bottom: 20px;
    width: 100%;
  `;

  const stepTitle = document.createElement('h1');
  stepTitle.style.cssText = `
    font-size: 56px;
    font-weight: 900;
    color: ${routine.color};
    margin: 0;
    word-break: break-word;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.05);
  `;
  stepTitle.textContent = step.title;

  titleBox.appendChild(stepTitle);
  main.appendChild(titleBox);

  // Métadonnées en grille 2 colonnes
  const metadataGrid = document.createElement('div');
  metadataGrid.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 25px;
    margin: 25px 0;
    width: 100%;
    max-width: 700px;
  `;

  // Boite Durée
  const durationBox = document.createElement('div');
  durationBox.style.cssText = `
    background: ${bgColor};
    border: 3px solid ${routine.color};
    border-radius: 16px;
    padding: 25px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  `;

  const durationNum = document.createElement('div');
  durationNum.style.cssText = `
    font-size: 48px;
    font-weight: 900;
    color: ${routine.color};
    margin-bottom: 8px;
  `;
  durationNum.textContent = `${step.durationMinutes}`;

  const durationLabel = document.createElement('div');
  durationLabel.style.cssText = `
    font-size: 16px;
    color: #666;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `;
  durationLabel.textContent = 'minutes';

  durationBox.appendChild(durationNum);
  durationBox.appendChild(durationLabel);
  metadataGrid.appendChild(durationBox);

  // Boite Statut
  const statusBox = document.createElement('div');
  const statusColor = step.isRequired ? '#2E7D32' : '#FF9800';
  const statusBgColor = step.isRequired ? '#E8F5E920' : '#FFF3E020';
  
  statusBox.style.cssText = `
    background: ${statusBgColor};
    border: 3px solid ${statusColor};
    border-radius: 16px;
    padding: 25px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  `;

  const statusIcon = document.createElement('div');
  statusIcon.style.cssText = `
    font-size: 48px;
    font-weight: 900;
    color: ${statusColor};
    margin-bottom: 8px;
  `;
  statusIcon.textContent = step.isRequired ? '✓' : '◇';

  const statusLabel = document.createElement('div');
  statusLabel.style.cssText = `
    font-size: 16px;
    color: ${statusColor};
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `;
  statusLabel.textContent = step.isRequired ? 'Obligatoire' : 'Facultatif';

  statusBox.appendChild(statusIcon);
  statusBox.appendChild(statusLabel);
  metadataGrid.appendChild(statusBox);

  main.appendChild(metadataGrid);

  // Instructions
  if (step.instruction) {
    const instructionBox = document.createElement('div');
    instructionBox.style.cssText = `
      background: linear-gradient(135deg, #FFF8F0 0%, #FFFBF7 100%);
      border-left: 8px solid ${routine.color};
      border-radius: 12px;
      padding: 25px 30px;
      margin-top: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    `;

    const instructionLabel = document.createElement('p');
    instructionLabel.style.cssText = `
      font-size: 12px;
      text-transform: uppercase;
      color: #999;
      font-weight: 800;
      margin: 0 0 12px 0;
      letter-spacing: 1px;
    `;
    instructionLabel.textContent = '📋 Consigne';

    const instructionText = document.createElement('p');
    instructionText.style.cssText = `
      font-size: 22px;
      color: #1a1a1a;
      line-height: 1.6;
      margin: 0;
      font-weight: 600;
      word-break: break-word;
    `;
    instructionText.textContent = step.instruction;

    instructionBox.appendChild(instructionLabel);
    instructionBox.appendChild(instructionText);
    main.appendChild(instructionBox);
    instructionBox.style.maxWidth = '900px';
    instructionBox.style.marginLeft = 'auto';
    instructionBox.style.marginRight = 'auto';
  }

  container.appendChild(main);

  // Pied de page coloré
  const footer = document.createElement('div');
  footer.style.cssText = `
    background: #F5F5F5;
    padding: 15px 40px;
    text-align: center;
    border-top: 2px solid ${routine.color};
    color: #999;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
  `;
  footer.textContent = `${routine.name} · ${new Date().toLocaleDateString('fr-FR')} · Étape ${stepNumber}/${totalSteps}`;
  container.appendChild(footer);

  return container;
}

/**
 * Calcule la durée totale d'une routine
 */
function getTotalDuration(routine: Routine): number {
  return routine.steps.reduce((total, step) => total + step.durationMinutes, 0);
}

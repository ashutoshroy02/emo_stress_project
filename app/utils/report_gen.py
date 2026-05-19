from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
import os

def generate_report(user_data, analysis_results, output_path):
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph("EchoCareAI AI - Wellness Report", styles['Title']))
    story.append(Spacer(1, 12))

    # User Info
    story.append(Paragraph(f"Patient: {user_data.get('username', 'Anonymous')}", styles['Normal']))
    story.append(Paragraph(f"Date: {analysis_results.get('timestamp')}", styles['Normal']))
    story.append(Spacer(1, 12))

    # Analysis Summary
    story.append(Paragraph("Analysis Summary", styles['Heading2']))
    data = [
        ["Metric", "Value"],
        ["Primary Emotion", analysis_results.get('emotion')],
        ["Confidence", f"{analysis_results.get('confidence', 0)*100:.1f}%"],
        ["Stress Level", f"{analysis_results.get('stress_score', 0)*100:.1f}%"]
    ]
    t = Table(data)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    # Wellness Guidance
    story.append(Paragraph("Wellness Guidance", styles['Heading2']))
    guidance = analysis_results.get('guidance', "Stay positive and practice deep breathing.")
    story.append(Paragraph(guidance, styles['Normal']))

    doc.build(story)
    return output_path

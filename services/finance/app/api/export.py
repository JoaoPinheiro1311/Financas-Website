from fastapi import APIRouter, HTTPException, Query, Response
from app.infrastructure.supabase_client import supabase
from datetime import datetime, timedelta
import csv
import io
import os

router = APIRouter()

@router.get("/csv")
async def export_csv(user_id: int, start_date: str = None, end_date: str = None):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        today = datetime.now()
        if not start_date:
            start_date = today.replace(day=1).strftime('%Y-%m-%d')
        if not end_date:
            next_month = today.replace(day=28) + timedelta(days=4)
            end_date = (next_month - timedelta(days=next_month.day)).strftime('%Y-%m-%d')
            
        resp = supabase.table('expenses').select('date, amount, type, notes, categories(name)').eq('user_id', user_id).gte('date', start_date).lte('date', end_date).order('date', desc=True).execute()
        transactions = resp.data or []
        
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';')
        writer.writerow(['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor (EUR)'])
        
        for t in transactions:
            writer.writerow([
                t['date'],
                t.get('notes', ''),
                (t.get('categories') or {}).get('name', 'Outros'),
                'Receita' if t['type'] == 'income' else 'Despesa',
                f"{float(t['amount']):.2f}".replace('.', ','),
            ])
            
        output.seek(0)
        filename = f"relatorio_{start_date}_{end_date}.csv"
        return Response(
            content=output.getvalue().encode('utf-8-sig'),
            media_type='text/csv',
            headers={'Content-Disposition': f'attachment; filename={filename}'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pdf")
async def export_pdf(user_id: int, start_date: str = None, end_date: str = None):
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER
    except ImportError:
        raise HTTPException(status_code=500, detail="reportlab not installed on server.")
        
    try:
        today = datetime.now()
        if not start_date:
            start_date = today.replace(day=1).strftime('%Y-%m-%d')
        if not end_date:
            next_month = today.replace(day=28) + timedelta(days=4)
            end_date = (next_month - timedelta(days=next_month.day)).strftime('%Y-%m-%d')
            
        resp = supabase.table('expenses').select('date, amount, type, notes, categories(name)').eq('user_id', user_id).gte('date', start_date).lte('date', end_date).order('date', desc=True).execute()
        transactions = resp.data or []
        
        total_income = sum(float(t['amount']) for t in transactions if t['type'] == 'income')
        total_expense = sum(float(t['amount']) for t in transactions if t['type'] == 'expense')
        balance = total_income - total_expense
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm, leftMargin=2*cm, rightMargin=2*cm)
        styles = getSampleStyleSheet()
        story = []
        
        # Titulo
        title_style = ParagraphStyle('title', parent=styles['Title'], fontSize=20, textColor=colors.HexColor('#0F172A'), alignment=TA_CENTER)
        story.append(Paragraph('Relatorio Financeiro', title_style))
        story.append(Paragraph(f'{start_date} -- {end_date}', ParagraphStyle('sub', parent=styles['Normal'], fontSize=11, textColor=colors.HexColor('#64748B'), alignment=TA_CENTER)))
        story.append(Spacer(1, 0.5*cm))
        
        summary_data = [
            ['Receitas', 'Despesas', 'Saldo'],
            [f'EUR {total_income:,.2f}', f'EUR {total_expense:,.2f}', f'EUR {balance:,.2f}'],
        ]
        summary_table = Table(summary_data, colWidths=[5.5*cm, 5.5*cm, 5.5*cm])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#F8FAFC')]),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 0.5*cm))
        
        table_data = [['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor (EUR)']]
        for t in transactions:
            table_data.append([
                t['date'],
                (t.get('notes') or '')[:35],
                (t.get('categories') or {}).get('name', 'Outros'),
                'Receita' if t['type'] == 'income' else 'Despesa',
                f"{float(t['amount']):,.2f}",
            ])
            
        trans_table = Table(table_data, colWidths=[2.5*cm, 6*cm, 3.5*cm, 2*cm, 2.5*cm])
        trans_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (4, 0), (4, -1), 'RIGHT'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
            ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#E2E8F0')),
        ]))
        story.append(trans_table)
        
        doc.build(story)
        buffer.seek(0)
        filename = f"relatorio_{start_date}_{end_date}.pdf"
        return Response(
            content=buffer.getvalue(),
            media_type='application/pdf',
            headers={'Content-Disposition': f'attachment; filename={filename}'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

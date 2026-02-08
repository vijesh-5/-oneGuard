from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Subscription as DBSubscription, Invoice as DBInvoice

router = APIRouter()

@router.get("/stats", tags=["dashboard"])
def get_dashboard_stats(db: Session = Depends(get_db)):
    active_subscriptions = db.query(DBSubscription).filter(DBSubscription.status == "active").count()
    
    total_revenue_result = db.query(func.sum(DBInvoice.grand_total)).filter(DBInvoice.status == "paid").scalar()
    total_revenue = float(total_revenue_result) if total_revenue_result is not None else 0.0

    unpaid_invoices = db.query(DBInvoice).filter(DBInvoice.status != "paid").count()

    return {
        "active_subscriptions": active_subscriptions,
        "total_revenue": total_revenue,
        "unpaid_invoices": unpaid_invoices
    }

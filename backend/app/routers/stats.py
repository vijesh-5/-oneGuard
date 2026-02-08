from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date

from ..database import get_db
from ..models import Subscription as DBSubscription, Invoice as DBInvoice, Plan as DBPlan, User
from ..dependencies import get_current_user

router = APIRouter()

@router.get("/dashboard", status_code=status.HTTP_200_OK)
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Active Subscriptions count
    active_subs_count = db.query(DBSubscription).filter(DBSubscription.status == "active", DBSubscription.user_id == current_user.id).count()
    
    # 2. Approximate MRR (Monthly Recurring Revenue)
    # Filter active subscriptions that have a plan with "monthly" billing period
    # Join plan and filter by user_id
    
    active_subs = db.query(DBSubscription).join(DBPlan).filter(
        DBSubscription.status == "active",
        DBSubscription.user_id == current_user.id
    ).all()
    
    mrr = 0.0
    for sub in active_subs:
        if sub.plan.billing_period == 'monthly':
            mrr += sub.grand_total
        elif sub.plan.billing_period == 'yearly':
            mrr += sub.grand_total / 12.0
            
    # 3. Pending Invoices
    pending_invoices_query = db.query(DBInvoice).filter(
        DBInvoice.status == "pending",
        DBInvoice.user_id == current_user.id
    )
    pending_count = pending_invoices_query.count()
    pending_amount = db.query(func.sum(DBInvoice.grand_total)).filter(
        DBInvoice.status == "pending",
        DBInvoice.user_id == current_user.id
    ).scalar() or 0.0
    
    # 4. Recent Activity (Last 5 Subscriptions)
    recent_subs = db.query(DBSubscription).filter(DBSubscription.user_id == current_user.id).order_by(DBSubscription.created_at.desc()).limit(5).all()
    recent_activity = [
        {
            "id": sub.id,
            "description": f"New subscription {sub.subscription_number}",
            "date": sub.created_at,
            "status": sub.status
        }
        for sub in recent_subs
    ]

    return {
        "active_subscriptions": active_subs_count,
        "mrr": round(mrr, 2),
        "pending_invoices_count": pending_count,
        "pending_invoices_amount": round(pending_amount, 2),
        "recent_activity": recent_activity
    }

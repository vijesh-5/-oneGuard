from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import Product, Plan, Customer, Subscription, SubscriptionLine, Invoice, InvoiceLine, Payment, User
from app.config import settings
from datetime import date, timedelta, datetime
import random

def seed():
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Get all non-portal users
    users = session.query(User).filter(User.mode.in_(['business', 'personal'])).all()
    if not users:
        print("No eligible users found to seed data for.")
        return

    print(f"Seeding data for {len(users)} users...")

    for owner in users:
        owner_id = owner.id
        print(f"Seeding data for owner: {owner.username} (ID: {owner_id})")

        # 1. Products
        products_data = [
            {"name": "Enterprise Cloud Infrastructure", "base_price": 499.0, "type": "Infrastructure", "description": "Scalable cloud resources for enterprise workloads."},
            {"name": "Software Licensing Suite", "base_price": 99.0, "type": "Software", "description": "Complete suite of productivity and collaboration tools."},
            {"name": "Managed Security Services", "base_price": 250.0, "type": "Service", "description": "24/7 monitoring and threat protection."},
            {"name": "Premium Tier Support", "base_price": 150.0, "type": "Service", "description": "Dedicated support engineer with 1hr SLA."}
        ]

        db_products = []
        for p in products_data:
            # Check if product already exists for this owner to avoid duplicates if re-run
            existing_p = session.query(Product).filter(Product.name == p['name'], Product.owner_id == owner_id).first()
            if existing_p:
                db_products.append(existing_p)
                continue
            db_p = Product(**p, owner_id=owner_id)
            session.add(db_p)
            db_products.append(db_p)
        
        session.flush() # Ensure products have IDs

        # 2. Plans
        billing_periods = ["monthly", "quarterly", "yearly"]
        multipliers = {"monthly": 1, "quarterly": 2.8, "yearly": 10}
        
        db_plans = []
        for product in db_products:
            for period in billing_periods:
                existing_plan = session.query(Plan).filter(Plan.product_id == product.id, Plan.billing_period == period, Plan.owner_id == owner_id).first()
                if existing_plan:
                    db_plans.append(existing_plan)
                    continue
                price = round(product.base_price * multipliers[period], 2)
                db_plan = Plan(
                    product_id=product.id,
                    name=f"{period.capitalize()} Plan",
                    billing_period=period,
                    price=price,
                    owner_id=owner_id
                )
                session.add(db_plan)
                db_plans.append(db_plan)
        
        session.flush()

        # 3. Customers
        customers_data = [
            {"name": f"Acme Corp ({owner.username})", "email": f"billing@{owner.username}.acme.com"},
            {"name": f"Globex Corporation ({owner.username})", "email": f"finance@{owner.username}.globex.org"},
            {"name": f"Soylent Corp ({owner.username})", "email": f"accounts@{owner.username}.soylent.net"}
        ]

        db_customers = []
        for c in customers_data:
            existing_c = session.query(Customer).filter(Customer.name == c['name'], Customer.owner_id == owner_id).first()
            if existing_c:
                db_customers.append(existing_c)
                continue
            db_c = Customer(**c, owner_id=owner_id)
            session.add(db_c)
            db_customers.append(db_c)
        
        session.flush()

        # 4. Subscriptions & Invoices
        for customer in db_customers:
            # Only seed if no subscriptions exist for this customer
            existing_sub = session.query(Subscription).filter(Subscription.customer_id == customer.id).first()
            if existing_sub:
                continue

            num_subs = random.randint(1, 2)
            target_plans = random.sample(db_plans, min(num_subs, len(db_plans)))
            
            for plan in target_plans:
                status = random.choice(["active", "active", "draft"]) # Leaning towards active
                sub_num = f"SUB-{random.randint(1000, 9999)}-{customer.id}-{owner_id}"
                start_date = date.today() - timedelta(days=random.randint(30, 90))
                
                db_sub = Subscription(
                    subscription_number=sub_num,
                    customer_id=customer.id,
                    plan_id=plan.id,
                    status=status,
                    start_date=start_date,
                    grand_total=plan.price,
                    created_at=datetime.utcnow()
                )
                
                if status == "active":
                    db_sub.confirmed_at = datetime.utcnow()
                    db_sub.next_billing_date = date.today() + timedelta(days=random.randint(1, 28))
                
                session.add(db_sub)
                session.flush()

                line = SubscriptionLine(
                    subscription_id=db_sub.id,
                    product_id=plan.product_id,
                    product_name_snapshot=plan.product.name,
                    unit_price_snapshot=plan.price,
                    quantity=1,
                    line_total=plan.price
                )
                session.add(line)

                if status == "active":
                    inv_num = f"INV-{random.randint(10000, 99999)}-{db_sub.id}"
                    invoice_status = "paid" if random.random() > 0.3 else "pending"
                    
                    db_invoice = Invoice(
                        invoice_number=inv_num,
                        subscription_id=db_sub.id,
                        customer_id=customer.id,
                        issue_date=start_date,
                        due_date=start_date + timedelta(days=30),
                        status=invoice_status,
                        grand_total=plan.price
                    )
                    
                    if invoice_status == "paid":
                        db_invoice.paid_date = start_date + timedelta(days=5)
                    
                    session.add(db_invoice)
                    session.flush()

                    inv_line = InvoiceLine(
                        invoice_id=db_invoice.id,
                        product_name=plan.product.name,
                        unit_price=plan.price,
                        quantity=1,
                        line_total=plan.price
                    )
                    session.add(inv_line)

                    if invoice_status == "paid":
                        db_payment = Payment(
                            invoice_id=db_invoice.id,
                            amount=plan.price,
                            method="credit_card",
                            status="success",
                            payment_date=datetime.utcnow() - timedelta(days=random.randint(1, 25))
                        )
                        session.add(db_payment)

    session.commit()
    print("Database seeding complete for all users.")
    session.close()

if __name__ == "__main__":
    seed()

#!/usr/bin/env python3
"""
========================================================================
VINAYAKA TIFFINS - PYTHON ZERO-DEPENDENCY BACKEND API SERVER
========================================================================
Serves the website files and manages DB storage (JSON files) on port 3000.
"""

import http.server
import json
import os
import secrets
import sys
import threading
import time
from urllib.parse import urlparse

PORT = int(os.environ.get("PORT", 3000))
ADMIN_USER = os.environ.get("ADMIN_USER", "admin")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "vinayaka@admin")
ADMIN_SESSION_TOKEN = secrets.token_hex(16)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(BASE_DIR, "db")

# File database paths
USERS_FILE = os.path.join(DB_DIR, "users.json")
PLANS_FILE = os.path.join(DB_DIR, "plans.json")
ORDERS_FILE = os.path.join(DB_DIR, "orders.json")
MESSAGES_FILE = os.path.join(DB_DIR, "messages.json")

# ==========================================================================
# DATABASE INITIALIZATION HELPER FUNCTIONS
# ==========================================================================

def init_db():
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)
    
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)
            
    if not os.path.exists(PLANS_FILE):
        with open(PLANS_FILE, "w", encoding="utf-8") as f:
            json.dump({}, f, indent=2)
            
    if not os.path.exists(ORDERS_FILE):
        with open(ORDERS_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)
            
    if not os.path.exists(MESSAGES_FILE):
        with open(MESSAGES_FILE, "w", encoding="utf-8") as f:
            json.dump([], f, indent=2)

def read_json_file(file_path, default_type=list):
    try:
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return default_type()

def write_json_file(file_path, data):
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error writing to {file_path}: {e}")

# ==========================================================================
# BACKGROUND ORDER TRACKER STATUS SIMULATOR
# ==========================================================================

def update_order_status_db(order_id, next_status):
    orders = read_json_file(ORDERS_FILE, list)
    updated = False
    for order in orders:
        if order.get("orderId") == order_id:
            order["status"] = next_status
            updated = True
            break
    if updated:
        write_json_file(ORDERS_FILE, orders)
        print(f"[Order Simulator] Order {order_id} status updated to: {next_status}")

def simulate_order_lifecycle(order_id):
    # Step 1: Verification (simulated UTR verification delay: 8 seconds)
    time.sleep(8)
    update_order_status_db(order_id, "Preparing")
    
    # Step 2: Preparing in kitchen (simulated delay: 15 seconds)
    time.sleep(15)
    update_order_status_db(order_id, "Delivering")
    
    # Step 3: Out for Delivery (simulated delivery route delay: 15 seconds)
    time.sleep(15)
    update_order_status_db(order_id, "Completed")

# ==========================================================================
# REQUEST HANDLER LOGIC
# ==========================================================================

class VinayakaHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    
    # Disable default console logging of standard requests for cleanliness
    def log_message(self, format, *args):
        # Only log API route calls, ignore asset logging
        if "/api/" in args[0]:
            sys.stderr.write("%s - - [%s] %s\n" %
                             (self.address_string(),
                              self.log_date_time_string(),
                              format%args))

    def is_admin_authorized(self):
        token = self.headers.get("X-Admin-Token")
        return token == ADMIN_SESSION_TOKEN

    def send_json_response(self, data, status_code=200):
        try:
            response_bytes = json.dumps(data).encode("utf-8")
            self.send_response(status_code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(response_bytes)))
            # Enable CORS headers for development flexibility
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token")
            self.end_headers()
            self.wfile.write(response_bytes)
        except Exception as e:
            print(f"Error sending JSON response: {e}")

    def do_OPTIONS(self):
        # Support CORS preflight requests
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Admin-Token")
        self.end_headers()

    def do_GET(self):
        url_parsed = urlparse(self.path)
        path_str = url_parsed.path

        # Check authorization for all admin API GET endpoints
        if path_str.startswith("/api/admin/"):
            if not self.is_admin_authorized():
                return self.send_json_response({"error": "Unauthorized access"}, 401)

        # 1. API: Fetch Weekly Plan for User
        # Route: /api/plans/<phone>
        if path_str.startswith("/api/plans/"):
            phone = path_str.replace("/api/plans/", "")
            plans = read_json_file(PLANS_FILE, dict)
            user_plan = plans.get(phone, [])
            return self.send_json_response(user_plan)

        # 2. API: Fetch Live Status of Specific Order
        # Route: /api/orders/<orderId>
        elif path_str.startswith("/api/orders/") and not path_str.startswith("/api/orders/user/"):
            order_id = path_str.replace("/api/orders/", "")
            orders = read_json_file(ORDERS_FILE, list)
            order = next((o for o in orders if o.get("orderId") == order_id), None)
            
            if order:
                return self.send_json_response(order)
            else:
                return self.send_json_response({"error": "Order not found"}, 404)

        # 3. API: Fetch User Order History
        # Route: /api/orders/user/<phone>
        elif path_str.startswith("/api/orders/user/"):
            phone = path_str.replace("/api/orders/user/", "")
            orders = read_json_file(ORDERS_FILE, list)
            user_orders = [o for o in orders if o.get("phone") == phone]
            user_orders.reverse() # Latest first
            return self.send_json_response(user_orders)

        # 4. API: Admin Dashboard Stats
        elif path_str == "/api/admin/stats":
            users = read_json_file(USERS_FILE, list)
            orders = read_json_file(ORDERS_FILE, list)
            total_sales = sum(float(o.get("total", 0)) for o in orders if o.get("status") == "Completed")
            active_orders_count = sum(1 for o in orders if o.get("status") in ["Verifying", "Preparing", "Delivering"])
            stats = {
                "totalSales": total_sales,
                "totalOrders": len(orders),
                "activeOrders": active_orders_count,
                "totalUsers": len(users)
            }
            return self.send_json_response(stats)

        # 5. API: Admin User List
        elif path_str == "/api/admin/users":
            users = read_json_file(USERS_FILE, list)
            response_users = []
            for u in users:
                u_copy = u.copy()
                u_copy.pop("password", None)
                response_users.append(u_copy)
            return self.send_json_response(response_users)

        # 6. API: Admin Orders List
        elif path_str == "/api/admin/orders":
            orders = read_json_file(ORDERS_FILE, list)
            orders.reverse()
            return self.send_json_response(orders)

        # 7. API: Admin Messages/Feedback List
        elif path_str == "/api/admin/messages":
            messages = read_json_file(MESSAGES_FILE, list)
            messages.reverse()
            return self.send_json_response(messages)

        # 8. Standard Static File Serving Handler
        else:
            # Direct routing helper for administrative panel
            if path_str == "/admin":
                self.path = "/admin.html"
            # Overwrite directory path check to fallback to index.html for unknown routes (SPA)
            elif not os.path.exists(os.path.join(BASE_DIR, path_str.strip("/"))):
                self.path = "/index.html"
            super().do_GET()

    def do_POST(self):
        url_parsed = urlparse(self.path)
        path_str = url_parsed.path

        # Read POST Body Content
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')
        req_data = {}
        if body:
            try:
                req_data = json.loads(body)
            except Exception as e:
                print(f"Error parsing post JSON body: {e}")
                return self.send_json_response({"error": "Invalid JSON format in body"}, 400)

        # 1. API: User Profile Registration
        if path_str == "/api/auth/register":
            name = req_data.get("name")
            phone = req_data.get("phone")
            email = req_data.get("email")
            password = req_data.get("password")
            house = req_data.get("house", "")
            address = req_data.get("address")

            if not name or not phone or not email or not password or not address:
                return self.send_json_response({"error": "Missing profile details"}, 400)

            users = read_json_file(USERS_FILE, list)
            if any(u.get("phone") == phone for u in users):
                return self.send_json_response({"error": "Mobile number is already registered"}, 400)

            new_user = {
                "name": name,
                "phone": phone,
                "email": email,
                "password": password,
                "house": house,
                "address": address,
                "registeredAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            users.append(new_user)
            write_json_file(USERS_FILE, users)

            # Return user info without returning password
            response_user = new_user.copy()
            response_user.pop("password", None)
            return self.send_json_response(response_user, 201)

        # 2. API: User Login
        elif path_str == "/api/auth/login":
            phone = req_data.get("phone")
            password = req_data.get("password")

            if not phone or not password:
                return self.send_json_response({"error": "Mobile number and password are required"}, 400)

            users = read_json_file(USERS_FILE, list)
            user = next((u for u in users if u.get("phone") == phone and u.get("password") == password), None)

            if not user:
                return self.send_json_response({"error": "Invalid mobile number or password credentials"}, 401)

            response_user = user.copy()
            response_user.pop("password", None)
            return self.send_json_response(response_user, 200)

        # 3. API: Save Weekly Plan
        elif path_str == "/api/plans":
            phone = req_data.get("phone")
            plan = req_data.get("plan")

            if not phone or plan is None:
                return self.send_json_response({"error": "Phone and plan details are required"}, 400)

            plans = read_json_file(PLANS_FILE, dict)
            plans[phone] = plan
            write_json_file(PLANS_FILE, plans)

            return self.send_json_response({"message": "Weekly plan saved successfully"}, 200)

        # 4. API: Create New Order
        elif path_str == "/api/orders":
            name = req_data.get("name")
            phone = req_data.get("phone")
            address = req_data.get("address")
            total = req_data.get("total")
            txn = req_data.get("txn")
            items = req_data.get("items")

            if not name or not phone or not address or not total or not txn or not items:
                return self.send_json_response({"error": "Incomplete order checkout details"}, 400)

            orders = read_json_file(ORDERS_FILE, list)
            order_id = f"ORD-{int(time.time() * 1000)}"

            new_order = {
                "orderId": order_id,
                "name": name,
                "phone": phone,
                "address": address,
                "total": total,
                "txn": txn,
                "items": items,
                "status": "Verifying",
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }

            orders.append(new_order)
            write_json_file(ORDERS_FILE, orders)

            # Threaded simulation removed. Status will be controlled manually by the admin.
            return self.send_json_response(new_order, 201)

        # Admin Login
        elif path_str == "/api/admin/login":
            username = req_data.get("username")
            password = req_data.get("password")
            
            if username == ADMIN_USER and password == ADMIN_PASS:
                return self.send_json_response({"token": ADMIN_SESSION_TOKEN}, 200)
            else:
                return self.send_json_response({"error": "Invalid username or password"}, 401)

        # 5. API: Admin Update Order Status
        elif path_str == "/api/admin/orders/status":
            if not self.is_admin_authorized():
                return self.send_json_response({"error": "Unauthorized access"}, 401)
                
            order_id = req_data.get("orderId")
            status = req_data.get("status")

            if not order_id or not status:
                return self.send_json_response({"error": "Order ID and status are required"}, 400)

            orders = read_json_file(ORDERS_FILE, list)
            updated = False
            for o in orders:
                if o.get("orderId") == order_id:
                    o["status"] = status
                    updated = True
                    break
            
            if updated:
                write_json_file(ORDERS_FILE, orders)
                return self.send_json_response({"message": f"Order status updated to {status} successfully"}, 200)
            else:
                return self.send_json_response({"error": "Order not found"}, 404)

        # 6. API: Submit Customer Feedback/Message
        elif path_str == "/api/messages":
            name = req_data.get("name")
            phone = req_data.get("phone", "")
            message = req_data.get("message")

            if not name or not message:
                return self.send_json_response({"error": "Name and message are required"}, 400)

            messages = read_json_file(MESSAGES_FILE, list)
            new_message = {
                "name": name,
                "phone": phone,
                "message": message,
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }
            messages.append(new_message)
            write_json_file(MESSAGES_FILE, messages)

            return self.send_json_response(new_message, 201)

        else:
            return self.send_json_response({"error": "Route not found"}, 404)

# ==========================================================================
# MAIN EXECUTION
# ==========================================================================

if __name__ == "__main__":
    init_db()
    # Configure request handler to serve static assets from project directory
    os.chdir(BASE_DIR)
    
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, VinayakaHTTPRequestHandler)
    
    print("=" * 55)
    print("  Vinayaka Tiffins Python HTTP Server running live:")
    print(f"  -> http://localhost:{PORT}")
    print("=" * 55)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
        sys.exit(0)

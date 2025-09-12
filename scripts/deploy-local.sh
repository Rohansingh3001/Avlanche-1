#!/bin/bash

# Avalanche Subnet Local Deployment Script
# This script deploys a subnet to a local Avalanche network for development and testing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SUBNET_NAME=${1:-"testSubnet"}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SUBNETS_DIR="$PROJECT_ROOT/subnets"
LOGS_DIR="$PROJECT_ROOT/logs"

# Ensure logs directory exists
mkdir -p "$LOGS_DIR"

# Log file
LOG_FILE="$LOGS_DIR/deploy-local-$(date +%Y%m%d-%H%M%S).log"

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Avalanche CLI is installed
    if ! command_exists avalanche; then
        log_error "Avalanche CLI not found. Please install it first:"
        echo "curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command_exists node; then
        log_error "Node.js not found. Please install Node.js first."
        exit 1
    fi
    
    # Check if the subnet directory exists
    if [ ! -d "$SUBNETS_DIR/$SUBNET_NAME" ]; then
        log_error "Subnet directory not found: $SUBNETS_DIR/$SUBNET_NAME"
        log "Please run the subnet wizard first: npm run wizard"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to start local network
start_local_network() {
    log "Starting local Avalanche network..."
    
    # Check if local network is already running
    if avalanche network status 2>/dev/null | grep -q "Local network is running"; then
        log_warning "Local network is already running"
    else
        avalanche network start --avalanchego-version latest 2>&1 | tee -a "$LOG_FILE"
        
        # Wait for network to be ready
        log "Waiting for network to be ready..."
        sleep 10
        
        # Verify network is running
        if ! avalanche network status 2>/dev/null | grep -q "Local network is running"; then
            log_error "Failed to start local network"
            exit 1
        fi
        
        log_success "Local network started successfully"
    fi
}

# Function to create subnet
create_subnet() {
    log "Creating subnet: $SUBNET_NAME"
    
    cd "$SUBNETS_DIR/$SUBNET_NAME"
    
    # Check if subnet already exists
    if avalanche subnet list 2>/dev/null | grep -q "$SUBNET_NAME"; then
        log_warning "Subnet $SUBNET_NAME already exists"
    else
        # Create subnet using existing configuration
        if [ -f "genesis.json" ]; then
            avalanche subnet create "$SUBNET_NAME" \
                --genesis genesis.json \
                --vm SubnetEVM \
                --force 2>&1 | tee -a "$LOG_FILE"
        else
            log_error "Genesis file not found: genesis.json"
            exit 1
        fi
        
        log_success "Subnet $SUBNET_NAME created successfully"
    fi
}

# Function to deploy subnet
deploy_subnet() {
    log "Deploying subnet $SUBNET_NAME to local network..."
    
    cd "$SUBNETS_DIR/$SUBNET_NAME"
    
    # Deploy the subnet
    avalanche subnet deploy "$SUBNET_NAME" \
        --local \
        --subnet-config subnet-config.json 2>&1 | tee -a "$LOG_FILE"
    
    if [ $? -eq 0 ]; then
        log_success "Subnet deployed successfully"
    else
        log_error "Subnet deployment failed"
        exit 1
    fi
}

# Function to get deployment info
get_deployment_info() {
    log "Retrieving deployment information..."
    
    # Get subnet status
    avalanche subnet status "$SUBNET_NAME" --local 2>&1 | tee -a "$LOG_FILE"
    
    # Extract important information
    local RPC_URL=""
    local CHAIN_ID=""
    local BLOCKCHAIN_ID=""
    
    # Parse avalanche subnet status output
    STATUS_OUTPUT=$(avalanche subnet status "$SUBNET_NAME" --local 2>/dev/null)
    
    if echo "$STATUS_OUTPUT" | grep -q "RPC URL:"; then
        RPC_URL=$(echo "$STATUS_OUTPUT" | grep "RPC URL:" | awk '{print $3}')
    fi
    
    if echo "$STATUS_OUTPUT" | grep -q "Chain ID:"; then
        CHAIN_ID=$(echo "$STATUS_OUTPUT" | grep "Chain ID:" | awk '{print $3}')
    fi
    
    if echo "$STATUS_OUTPUT" | grep -q "Blockchain ID:"; then
        BLOCKCHAIN_ID=$(echo "$STATUS_OUTPUT" | grep "Blockchain ID:" | awk '{print $3}')
    fi
    
    # Save deployment info to file
    cat > deployment-info.json << EOF
{
    "subnetName": "$SUBNET_NAME",
    "deploymentTarget": "local",
    "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "rpcUrl": "$RPC_URL",
    "chainId": "$CHAIN_ID",
    "blockchainId": "$BLOCKCHAIN_ID",
    "explorerUrl": "",
    "status": "active"
}
EOF
    
    log_success "Deployment information saved to deployment-info.json"
    
    # Display connection details
    echo ""
    echo -e "${GREEN}🎉 Subnet Deployment Completed Successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Connection Details:${NC}"
    [ -n "$RPC_URL" ] && echo -e "   RPC URL:        ${GREEN}$RPC_URL${NC}"
    [ -n "$CHAIN_ID" ] && echo -e "   Chain ID:       ${GREEN}$CHAIN_ID${NC}"
    [ -n "$BLOCKCHAIN_ID" ] && echo -e "   Blockchain ID:  ${GREEN}$BLOCKCHAIN_ID${NC}"
    echo ""
    echo -e "${BLUE}🔗 Add to MetaMask:${NC}"
    echo -e "   Network Name:   ${GREEN}$SUBNET_NAME${NC}"
    echo -e "   RPC URL:        ${GREEN}$RPC_URL${NC}"
    echo -e "   Chain ID:       ${GREEN}$CHAIN_ID${NC}"
    echo -e "   Symbol:         ${GREEN}AVAX${NC}"
    echo ""
}

# Function to start monitoring
start_monitoring() {
    log "Starting monitoring services..."
    
    # Check if backend is running
    if ! pgrep -f "node.*server.js" > /dev/null; then
        log "Starting backend server..."
        cd "$PROJECT_ROOT/backend"
        npm start > "$LOGS_DIR/backend.log" 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > "$LOGS_DIR/backend.pid"
        log_success "Backend started (PID: $BACKEND_PID)"
    else
        log_warning "Backend server is already running"
    fi
    
    # Check if frontend is running
    if ! pgrep -f "react-scripts" > /dev/null; then
        log "Starting frontend server..."
        cd "$PROJECT_ROOT/frontend"
        npm start > "$LOGS_DIR/frontend.log" 2>&1 &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > "$LOGS_DIR/frontend.pid"
        log_success "Frontend started (PID: $FRONTEND_PID)"
    else
        log_warning "Frontend server is already running"
    fi
    
    echo ""
    echo -e "${GREEN}🚀 Services Started:${NC}"
    echo -e "   Dashboard:      ${GREEN}http://localhost:3000${NC}"
    echo -e "   API Server:     ${GREEN}http://localhost:5000${NC}"
    echo ""
}

# Function to cleanup on script exit
cleanup() {
    log "Cleaning up..."
    
    # Kill background processes if they were started by this script
    if [ -n "$BACKEND_PID" ] && kill -0 $BACKEND_PID 2>/dev/null; then
        log "Stopping backend server..."
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ -n "$FRONTEND_PID" ] && kill -0 $FRONTEND_PID 2>/dev/null; then
        log "Stopping frontend server..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
}

# Trap cleanup on script exit
trap cleanup EXIT INT TERM

# Main execution
main() {
    echo ""
    echo -e "${BLUE}🏔️  Avalanche Subnet Local Deployment${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo ""
    echo -e "Subnet Name: ${GREEN}$SUBNET_NAME${NC}"
    echo -e "Log File:    ${GREEN}$LOG_FILE${NC}"
    echo ""
    
    check_prerequisites
    start_local_network
    create_subnet
    deploy_subnet
    get_deployment_info
    
    # Ask if user wants to start monitoring
    echo ""
    read -p "Would you like to start the monitoring dashboard? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_monitoring
        
        echo ""
        echo -e "${GREEN}✅ Deployment and monitoring setup completed!${NC}"
        echo ""
        echo -e "${YELLOW}Press Ctrl+C to stop the monitoring services${NC}"
        
        # Keep script running to monitor services
        while true; do
            sleep 10
        done
    else
        echo ""
        log_success "Local deployment completed successfully!"
        echo ""
        echo -e "${BLUE}📚 Next Steps:${NC}"
        echo -e "   1. Add the subnet to MetaMask using the details above"
        echo -e "   2. Start monitoring: ${GREEN}npm run dev${NC}"
        echo -e "   3. Deploy contracts using the dashboard"
        echo ""
    fi
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

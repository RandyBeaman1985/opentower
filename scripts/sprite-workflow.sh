#!/bin/bash
# sprite-workflow.sh - Asset generation helper for OpenTower
# Version: 1.0
# Purpose: Automate sprite processing, testing, and integration

set -e

PROJECT_ROOT="/home/ubuntu/clawd/projects/opentower"
ASSETS_DIR="$PROJECT_ROOT/public/assets"
WORKING_DIR="$PROJECT_ROOT/.sprite-workspace"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create directories if they don't exist
mkdir -p "$ASSETS_DIR/buildings"
mkdir -p "$ASSETS_DIR/people"
mkdir -p "$ASSETS_DIR/elevators"
mkdir -p "$ASSETS_DIR/sky"
mkdir -p "$WORKING_DIR/raw"
mkdir -p "$WORKING_DIR/processed"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to check if file exists and has correct dimensions
check_dimensions() {
    local file=$1
    local expected_width=$2
    local expected_height=$3
    
    if [ ! -f "$file" ]; then
        print_error "File not found: $file"
        return 1
    fi
    
    # Use ImageMagick to check dimensions (if installed)
    if command -v identify &> /dev/null; then
        dimensions=$(identify -format "%wx%h" "$file" 2>/dev/null)
        actual_width=$(echo $dimensions | cut -d'x' -f1)
        actual_height=$(echo $dimensions | cut -d'x' -f2)
        
        if [ "$actual_width" != "$expected_width" ] || [ "$actual_height" != "$expected_height" ]; then
            print_warning "Dimension mismatch: Expected ${expected_width}x${expected_height}, got ${actual_width}x${actual_height}"
            return 1
        fi
        
        print_success "Dimensions correct: ${actual_width}x${actual_height}"
        return 0
    else
        print_warning "ImageMagick not installed - skipping dimension check"
        return 0
    fi
}

# Function to process raw AI-generated image
process_sprite() {
    local input_file=$1
    local output_file=$2
    local width=$3
    local height=$4
    
    print_warning "Processing: $(basename $input_file)"
    
    if command -v convert &> /dev/null; then
        # Use ImageMagick to resize and optimize
        convert "$input_file" \
            -resize "${width}x${height}!" \
            -filter Point \
            -colors 256 \
            -type Palette \
            "$output_file"
        
        print_success "Processed: $(basename $output_file)"
    else
        print_error "ImageMagick not installed - cannot process. Please install: sudo apt-get install imagemagick"
        return 1
    fi
}

# Function to list all assets and their status
list_assets() {
    echo ""
    echo "=== BUILDING SPRITES ==="
    find "$ASSETS_DIR/buildings" -name "*.png" -type f 2>/dev/null | while read -r file; do
        echo "  ✓ $(basename $file)"
    done
    
    building_count=$(find "$ASSETS_DIR/buildings" -name "*.png" -type f 2>/dev/null | wc -l)
    echo "Total: $building_count sprites"
    
    echo ""
    echo "=== PEOPLE SPRITES ==="
    find "$ASSETS_DIR/people" -name "*.png" -type f 2>/dev/null | while read -r file; do
        echo "  ✓ $(basename $file)"
    done
    
    people_count=$(find "$ASSETS_DIR/people" -name "*.png" -type f 2>/dev/null | wc -l)
    echo "Total: $people_count sprites"
    
    echo ""
    echo "=== ELEVATOR SPRITES ==="
    find "$ASSETS_DIR/elevators" -name "*.png" -type f 2>/dev/null | while read -r file; do
        echo "  ✓ $(basename $file)"
    done
    
    elevator_count=$(find "$ASSETS_DIR/elevators" -name "*.png" -type f 2>/dev/null | wc -l)
    echo "Total: $elevator_count sprites"
    
    echo ""
    echo "=== SKY BACKGROUNDS ==="
    find "$ASSETS_DIR/sky" -name "*.png" -type f 2>/dev/null | while read -r file; do
        echo "  ✓ $(basename $file)"
    done
    
    sky_count=$(find "$ASSETS_DIR/sky" -name "*.png" -type f 2>/dev/null | wc -l)
    echo "Total: $sky_count backgrounds"
    
    echo ""
    echo "=== OVERALL PROGRESS ==="
    total=$((building_count + people_count + elevator_count + sky_count))
    target=200
    percentage=$((total * 100 / target))
    echo "Total Assets: $total / $target ($percentage%)"
}

# Function to validate sprite naming
validate_naming() {
    echo ""
    echo "=== VALIDATING ASSET NAMES ==="
    
    invalid_count=0
    
    # Check building sprites
    find "$ASSETS_DIR/buildings" -name "*.png" -type f 2>/dev/null | while read -r file; do
        basename=$(basename "$file" .png)
        
        # Should match: {buildingType}-{state}.png
        if [[ ! "$basename" =~ ^[a-z]+-[a-z0-9]+$ ]]; then
            print_warning "Invalid name: $(basename $file)"
            invalid_count=$((invalid_count + 1))
        fi
    done
    
    if [ $invalid_count -eq 0 ]; then
        print_success "All asset names valid"
    else
        print_error "$invalid_count invalid names found"
    fi
}

# Function to generate a missing asset report
missing_report() {
    echo ""
    echo "=== MISSING ASSETS REPORT ==="
    echo ""
    
    # Phase 1 Priority Assets
    echo "Phase 1 Priority (38 sprites needed):"
    
    phase1_buildings=(
        "office-empty" "office-half" "office-full"
        "office-night-empty" "office-night-half" "office-night-full"
        "lobby-1star" "lobby-2star"
        "fastfood-empty" "fastfood-busy"
        "fastfood-night-empty" "fastfood-night-busy"
    )
    
    for sprite in "${phase1_buildings[@]}"; do
        if [ ! -f "$ASSETS_DIR/buildings/${sprite}.png" ]; then
            echo "  ✗ buildings/${sprite}.png"
        else
            echo "  ✓ buildings/${sprite}.png"
        fi
    done
    
    # People sprites
    echo ""
    echo "People Sprites (30 needed):"
    colors=("black" "lightpink" "darkpink" "red" "darkred")
    directions=("left" "right")
    animations=("idle" "walk-1" "walk-2")
    
    for color in "${colors[@]}"; do
        for direction in "${directions[@]}"; do
            for animation in "${animations[@]}"; do
                sprite="person-${color}-${direction}-${animation}"
                if [ ! -f "$ASSETS_DIR/people/${sprite}.png" ]; then
                    echo "  ✗ people/${sprite}.png"
                else
                    echo "  ✓ people/${sprite}.png"
                fi
            done
        done
    done
    
    # Elevator sprites
    echo ""
    echo "Elevator Sprites (7 needed):"
    elevator_sprites=(
        "elevator-shaft-standard"
        "elevator-car-empty" "elevator-car-half" "elevator-car-full"
        "elevator-door-closed" "elevator-door-open-1" "elevator-door-open-3"
    )
    
    for sprite in "${elevator_sprites[@]}"; do
        if [ ! -f "$ASSETS_DIR/elevators/${sprite}.png" ]; then
            echo "  ✗ elevators/${sprite}.png"
        else
            echo "  ✓ elevators/${sprite}.png"
        fi
    done
    
    # Sky backgrounds
    echo ""
    echo "Sky Backgrounds (5 needed):"
    sky_sprites=(
        "sky-morning" "sky-noon" "sky-evening" "sky-dusk" "sky-night"
    )
    
    for sprite in "${sky_sprites[@]}"; do
        if [ ! -f "$ASSETS_DIR/sky/${sprite}.png" ]; then
            echo "  ✗ sky/${sprite}.png"
        else
            echo "  ✓ sky/${sprite}.png"
        fi
    done
}

# Function to create placeholder sprites (for testing)
create_placeholders() {
    echo ""
    echo "=== CREATING PLACEHOLDER SPRITES ==="
    
    if ! command -v convert &> /dev/null; then
        print_error "ImageMagick required. Install: sudo apt-get install imagemagick"
        return 1
    fi
    
    # Create simple colored rectangle placeholders
    
    # Office sprites (144x36)
    convert -size 144x36 xc:blue "$ASSETS_DIR/buildings/office-empty.png"
    convert -size 144x36 xc:lightblue "$ASSETS_DIR/buildings/office-half.png"
    convert -size 144x36 xc:darkblue "$ASSETS_DIR/buildings/office-full.png"
    print_success "Created office placeholders"
    
    # Lobby sprites (64x36)
    convert -size 64x36 xc:tan "$ASSETS_DIR/buildings/lobby-1star.png"
    print_success "Created lobby placeholders"
    
    # Fast food sprites (256x36)
    convert -size 256x36 xc:red "$ASSETS_DIR/buildings/fastfood-empty.png"
    convert -size 256x36 xc:yellow "$ASSETS_DIR/buildings/fastfood-busy.png"
    print_success "Created fast food placeholders"
    
    # Person sprite (8x16)
    convert -size 8x16 xc:black "$ASSETS_DIR/people/person-black-left-idle.png"
    print_success "Created person placeholder"
    
    # Elevator sprites
    convert -size 32x36 xc:gray "$ASSETS_DIR/elevators/elevator-shaft-standard.png"
    convert -size 28x30 xc:silver "$ASSETS_DIR/elevators/elevator-car-empty.png"
    convert -size 32x8 xc:darkgray "$ASSETS_DIR/elevators/elevator-door-closed.png"
    print_success "Created elevator placeholders"
    
    # Sky sprites (6000x1200 - large!)
    convert -size 6000x1200 xc:lightblue "$ASSETS_DIR/sky/sky-noon.png"
    print_success "Created sky placeholder"
    
    print_success "Placeholders created! These are for testing only."
    print_warning "Replace with real AI-generated sprites ASAP."
}

# Main menu
show_menu() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║   OpenTower Sprite Workflow Helper    ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "1) List all assets"
    echo "2) Validate asset naming"
    echo "3) Missing assets report"
    echo "4) Create placeholder sprites (testing only)"
    echo "5) Process raw sprite (resize/optimize)"
    echo "6) Check sprite dimensions"
    echo "7) Open SPRITE-PROMPTS.md"
    echo "8) Exit"
    echo ""
    read -p "Select option: " choice
    
    case $choice in
        1) list_assets ;;
        2) validate_naming ;;
        3) missing_report ;;
        4) create_placeholders ;;
        5) 
            read -p "Input file path: " input_file
            read -p "Output file path: " output_file
            read -p "Width: " width
            read -p "Height: " height
            process_sprite "$input_file" "$output_file" "$width" "$height"
            ;;
        6)
            read -p "File path: " file_path
            read -p "Expected width: " exp_width
            read -p "Expected height: " exp_height
            check_dimensions "$file_path" "$exp_width" "$exp_height"
            ;;
        7) 
            if [ -f "$PROJECT_ROOT/.planning/SPRITE-PROMPTS.md" ]; then
                cat "$PROJECT_ROOT/.planning/SPRITE-PROMPTS.md"
            else
                print_error "SPRITE-PROMPTS.md not found"
            fi
            ;;
        8) exit 0 ;;
        *) print_error "Invalid option" ;;
    esac
    
    show_menu
}

# Run menu if no arguments provided
if [ $# -eq 0 ]; then
    show_menu
else
    # Allow direct commands
    case $1 in
        list) list_assets ;;
        validate) validate_naming ;;
        missing) missing_report ;;
        placeholders) create_placeholders ;;
        *) print_error "Unknown command: $1" ;;
    esac
fi

#!/usr/bin/env bash
#
# Script Name: retry.sh
# Description: Exponential backoff retry utility for command execution
# Usage: ./retry.sh [options] -- command_to_retry
# Dependencies: bash (no external tools required)
# Platform notes: Works on WSL, Ubuntu, macOS
#

set -euo pipefail
if [[ -n "${DEBUG:-}" ]]; then
  set -x
fi

# Constants
readonly DEFAULT_DESCRIPTION=""
readonly DEFAULT_MAX_ATTEMPTS=5
readonly DEFAULT_INITIAL_DELAY=2
readonly DEFAULT_MAX_DELAY=60
readonly DEFAULT_MULTIPLIER=2
readonly DEFAULT_JITTER_PERCENT=25

# Colors for output (readonly)
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[0;33m'
readonly BLUE='\033[0;34m'
readonly RESET='\033[0m'

# Global variables (will be set by parse_arguments)
DESCRIPTION="${DEFAULT_DESCRIPTION}"
MAX_ATTEMPTS="${DEFAULT_MAX_ATTEMPTS}"
INITIAL_DELAY="${DEFAULT_INITIAL_DELAY}"
MAX_DELAY="${DEFAULT_MAX_DELAY}"
MULTIPLIER="${DEFAULT_MULTIPLIER}"
JITTER_PERCENT="${DEFAULT_JITTER_PERCENT}"
declare -a COMMAND_ARGS=()

# Function: show_help
# Description: Display usage information and examples
# Arguments: None
# Returns: 0 always
function show_help() {
  cat << 'EOF'
Exponential backoff retry script

Usage: ./retry.sh [options] -- command_to_retry

Options:
  -d, --description DESC     Description of the operation (for logging)
  -a, --attempts NUM         Maximum number of attempts (default: 5)
  -i, --initial-delay NUM    Initial delay in seconds (default: 2)
  -m, --max-delay NUM        Maximum delay in seconds (default: 60)
  -x, --multiplier NUM       Delay multiplier (default: 2)
  -j, --jitter PERCENT       Jitter percentage 0-100 (default: 25)
  -h, --help                 Show this help

Examples:
  # Basic usage
  ./retry.sh -- curl -fsSL https://example.com/file

  # With custom description and attempts
  ./retry.sh -d "Download important file" -a 3 -- curl -fsSL https://example.com/file

  # With custom timing
  ./retry.sh -d "API call" -i 1 -m 30 -x 3 -- curl -fsSL https://api.example.com/data
EOF
}

# Function: validate_positive_integer
# Description: Validate that a value is a positive integer
# Arguments: $1 - value to validate, $2 - parameter name for error message
# Returns: 0 on success, 1 on error
function validate_positive_integer() {
  local readonly value="${1:-}"
  local readonly param_name="${2:-parameter}"

  [[ -n "${value}" ]] || {
    echo -e "${RED}Error: ${param_name} cannot be empty${RESET}" >&2
    return 1
  }

  [[ "${value}" =~ ^[0-9]+$ ]] || {
    echo -e "${RED}Error: ${param_name} must be a positive integer${RESET}" >&2
    return 1
  }

  [[ "${value}" -gt 0 ]] || {
    echo -e "${RED}Error: ${param_name} must be greater than 0${RESET}" >&2
    return 1
  }

  return 0
}

# Function: validate_jitter_percent
# Description: Validate jitter percentage is between 0-100
# Arguments: $1 - jitter percentage value
# Returns: 0 on success, 1 on error
function validate_jitter_percent() {
  local readonly value="${1:-}"

  [[ -n "${value}" ]] || {
    echo -e "${RED}Error: jitter percentage cannot be empty${RESET}" >&2
    return 1
  }

  [[ "${value}" =~ ^[0-9]+$ ]] || {
    echo -e "${RED}Error: jitter must be an integer${RESET}" >&2
    return 1
  }

  [[ "${value}" -ge 0 && "${value}" -le 100 ]] || {
    echo -e "${RED}Error: jitter must be between 0 and 100${RESET}" >&2
    return 1
  }

  return 0
}

# Function: parse_arguments
# Description: Parse command line arguments and validate them
# Arguments: All command line arguments ("$@")
# Returns: 0 on success, 1 on error
# Notes: Modifies global variables for configuration
function parse_arguments() {
  while [[ $# -gt 0 ]]; do
    case "${1}" in
      -d|--description)
        [[ -n "${2:-}" ]] || {
          echo -e "${RED}Error: --description requires a value${RESET}" >&2
          return 1
        }
        DESCRIPTION="${2}"
        shift 2
        ;;
      -a|--attempts)
        [[ -n "${2:-}" ]] || {
          echo -e "${RED}Error: --attempts requires a value${RESET}" >&2
          return 1
        }
        validate_positive_integer "${2}" "attempts" || return 1
        MAX_ATTEMPTS="${2}"
        shift 2
        ;;
      -i|--initial-delay)
        [[ -n "${2:-}" ]] || {
          echo -e "${RED}Error: --initial-delay requires a value${RESET}" >&2
          return 1
        }
        validate_positive_integer "${2}" "initial-delay" || return 1
        INITIAL_DELAY="${2}"
        shift 2
        ;;
      -m|--max-delay)
        [[ -n "${2:-}" ]] || {
          echo -e "${RED}Error: --max-delay requires a value${RESET}" >&2
          return 1
        }
        validate_positive_integer "${2}" "max-delay" || return 1
        MAX_DELAY="${2}"
        shift 2
        ;;
      -x|--multiplier)
        [[ -n "${2:-}" ]] || {
          echo -e "${RED}Error: --multiplier requires a value${RESET}" >&2
          return 1
        }
        validate_positive_integer "${2}" "multiplier" || return 1
        MULTIPLIER="${2}"
        shift 2
        ;;
      -j|--jitter)
        [[ -n "${2:-}" ]] || {
          echo -e "${RED}Error: --jitter requires a value${RESET}" >&2
          return 1
        }
        validate_jitter_percent "${2}" || return 1
        JITTER_PERCENT="${2}"
        shift 2
        ;;
      -h|--help)
        show_help
        exit 0
        ;;
      --)
        shift
        COMMAND_ARGS=("$@")
        break
        ;;
      *)
        echo -e "${RED}Error: Unknown option '${1}'${RESET}" >&2
        show_help
        return 1
        ;;
    esac
  done

  # Validate command was provided
  [[ "${#COMMAND_ARGS[@]}" -gt 0 ]] || {
    echo -e "${RED}Error: No command provided after '--'${RESET}" >&2
    show_help
    return 1
  }

  return 0
}

# Function: calculate_delay_with_jitter
# Description: Calculate delay with exponential backoff and jitter
# Arguments: $1 - base delay in seconds
# Returns: 0 always
# Outputs: Calculated delay to stdout
function calculate_delay_with_jitter() {
  local readonly base_delay="${1}"
  local jitter_range
  local jitter
  local actual_delay

  # Calculate jitter range
  jitter_range=$(( base_delay * JITTER_PERCENT / 100 ))

  # Generate random jitter (can be positive or negative)
  if [[ "${jitter_range}" -gt 0 ]]; then
    jitter=$(( (RANDOM % (jitter_range * 2 + 1)) - jitter_range ))
  else
    jitter=0
  fi

  actual_delay=$(( base_delay + jitter ))

  # Ensure minimum delay of 1 second
  [[ "${actual_delay}" -ge 1 ]] || actual_delay=1

  echo "${actual_delay}"
}

# Function: execute_retry_loop
# Description: Main retry logic with exponential backoff
# Arguments: None (uses global COMMAND_ARGS array)
# Returns: Command exit code on success, or final exit code on failure
function execute_retry_loop() {
  local attempt=1
  local delay="${INITIAL_DELAY}"
  local exit_code
  local actual_delay

  # Show operation details
  if [[ -n "${DESCRIPTION}" ]]; then
    echo -e "${BLUE}🔄 Starting: ${DESCRIPTION}${RESET}"
  else
    echo -e "${BLUE}🔄 Starting: ${COMMAND_ARGS[*]}${RESET}"
  fi

  while [[ "${attempt}" -le "${MAX_ATTEMPTS}" ]]; do
    echo -e "${BLUE}📋 Attempt ${attempt}/${MAX_ATTEMPTS}${RESET}"

    # Execute the command with explicit error handling
    set +e  # Temporarily disable exit on error
    "${COMMAND_ARGS[@]}"
    exit_code="$?"
    set -e  # Re-enable exit on error

    # Check if command succeeded
    if [[ "${exit_code}" -eq 0 ]]; then
      if [[ "${attempt}" -gt 1 ]]; then
        echo -e "${GREEN}✅ Success after $((attempt - 1)) retries${RESET}"
      else
        echo -e "${GREEN}✅ Success on first attempt${RESET}"
      fi
      return 0
    fi

    # Log the specific error
    echo -e "${RED}⚠️  Command failed with exit code: ${exit_code}${RESET}"

    # Check if this was the last attempt
    if [[ "${attempt}" -eq "${MAX_ATTEMPTS}" ]]; then
      echo -e "${RED}❌ Failed after ${MAX_ATTEMPTS} attempts (final exit code: ${exit_code})${RESET}"
      return "${exit_code}"
    fi

    # Calculate delay with jitter
    actual_delay="$(calculate_delay_with_jitter "${delay}")"

    echo -e "${YELLOW}⏳ Waiting ${actual_delay}s before retry... (base: ${delay}s)${RESET}"
    sleep "${actual_delay}"

    # Calculate next delay with exponential backoff
    delay=$(( delay * MULTIPLIER ))
    [[ "${delay}" -le "${MAX_DELAY}" ]] || delay="${MAX_DELAY}"

    (( attempt++ ))
  done
}

# Function: main
# Description: Main entry point for the script
# Arguments: All command line arguments
# Returns: 0 on success, 1 on error, or command exit code
function main() {
  # Parse and validate arguments
  parse_arguments "$@" || {
    echo -e "${RED}Failed to parse arguments${RESET}" >&2
    return 1
  }

  # Execute retry loop
  execute_retry_loop
}

# Self-test functionality
if [[ "${1:-}" == "--test" ]]; then
  echo "Running self-tests..."

  # Test validation functions
  if validate_positive_integer "5" "test" >/dev/null 2>&1; then
    echo "✓ validate_positive_integer works"
  else
    echo "✗ validate_positive_integer failed"
    exit 1
  fi

  if validate_jitter_percent "25" >/dev/null 2>&1; then
    echo "✓ validate_jitter_percent works"
  else
    echo "✗ validate_jitter_percent failed"
    exit 1
  fi

  echo "Self-tests passed"
  exit 0
fi

# Execute main function with all arguments
main "$@"

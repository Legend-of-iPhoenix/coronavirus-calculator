#!/bin/bash
java -jar compiler.jar \
	--jscomp_warning=es5Strict \
	--language_out=ES5 \
	--warning_level=VERBOSE \
	--assume_function_wrapper \
	--isolation_mode=IIFE \
	--use_types_for_optimization \
	--compilation_level=ADVANCED_OPTIMIZATIONS \
	--js_output_file=scripts/script.min.js \
  --js=scripts/script.js

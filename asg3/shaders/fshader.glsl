#ifdef GL_ES
precision mediump float;
#endif

// Input color and texture
varying vec4 v_Color;
varying vec2 v_TexCoord;
uniform sampler2D u_Sampler;

// Lighting uniforms
uniform float u_SpecularN;
uniform int u_RenderNormals;
uniform int u_UseLighting;
uniform vec3 u_AmbientLight;
uniform vec3 u_DiffuseColor;
uniform vec3 u_SpecularColor;
uniform vec3 u_LightPosition;
uniform vec3 u_ViewPosition;

// Varying for position and normal
varying vec3 v_Position;
varying vec3 v_Normal;

void main() {
    vec3 norm = normalize(v_Normal); // Normalize since interpolation affects length

    // If in normal rendering mode
    if (u_RenderNormals == 1) {
        gl_FragColor = vec4(norm * 0.5 + 0.5, 1.0);
    } else {
        // Base texture color
        vec4 texelColor = v_Color + texture2D(u_Sampler, v_TexCoord);

        if (u_UseLighting == 1) {
            // Compute lighting direction
            vec3 L = normalize(u_LightPosition - v_Position);

            // Diffuse component
            float lambert = max(dot(norm, L), 0.0);
            vec3 diffuseLight = u_DiffuseColor * lambert;

            // Specular component (initialize to zero)
            vec3 specularLight = vec3(0.0);

            if (lambert > 0.0) {
                vec3 viewDir = normalize(u_ViewPosition - v_Position);
                vec3 reflectDir = reflect(-L, norm);
                float specFactor = pow(clamp(dot(viewDir, reflectDir), 0.0, 1.0), u_SpecularN);
                specularLight = u_SpecularColor * specFactor;
            }

            // Combine ambient, diffuse, and specular
            vec3 combinedLight = u_AmbientLight + diffuseLight + specularLight;
            gl_FragColor = vec4(texelColor.rgb * combinedLight, texelColor.a);
        } else {
            // If lighting is off, just use base texture color
            gl_FragColor = texelColor;
        }
    }
}